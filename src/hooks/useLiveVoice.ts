import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus, CompanionState, ChatMessage } from '../types';
import { float32ToInt16, arrayBufferToBase64, base64ToAudioBuffer } from '../utils/audio';

export interface UseLiveVoiceOptions {
  language: string;
  voice: string;
  onTranscriptionUpdate?: (text: string, sender: 'user' | 'serenade') => void;
}

export function useLiveVoice({ language, voice }: UseLiveVoiceOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [companionState, setCompanionState] = useState<CompanionState>('idle');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingTranscript, setStreamingTranscript] = useState<{ sender: 'user' | 'serenade'; text: string } | null>(null);

  // Audio levels for reactive visualizer (0.0 to 1.0)
  const [userAudioLevel, setUserAudioLevel] = useState<number>(0);
  const [modelAudioLevel, setModelAudioLevel] = useState<number>(0);

  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);

  // Audio contexts
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const userAnalyserRef = useRef<AnalyserNode | null>(null);
  const modelAnalyserRef = useRef<AnalyserNode | null>(null);

  // Scheduled audio playback queue
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isSpeakingRef = useRef<boolean>(false);
  const speakingTimerRef = useRef<any>(null);

  // Level animation frame
  const animFrameRef = useRef<number | null>(null);

  // Keep references to current language and voice
  const langRef = useRef(language);
  langRef.current = language;
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  // Track muted state in ref for onaudioprocess callback
  const isMicMutedRef = useRef(isMicMuted);
  isMicMutedRef.current = isMicMuted;

  // Stop all currently playing audio chunks immediately (upon interruption)
  const stopAllAudio = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    }
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    isSpeakingRef.current = false;
    setCompanionState((prev) => (prev === 'speaking' ? 'idle' : prev));
  }, []);

  // Play an incoming 24kHz PCM chunk
  const playAudioChunk = useCallback((base64: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
      }

      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!modelAnalyserRef.current) {
        modelAnalyserRef.current = ctx.createAnalyser();
        modelAnalyserRef.current.fftSize = 64;
        modelAnalyserRef.current.smoothingTimeConstant = 0.5;
        modelAnalyserRef.current.connect(ctx.destination);
      }

      const buffer = base64ToAudioBuffer(base64, ctx, 24000);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(modelAnalyserRef.current);

      const currentTime = ctx.currentTime;
      // Schedule gapless playback
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;

      activeSourcesRef.current.push(source);
      isSpeakingRef.current = true;
      setCompanionState('speaking');

      // Clear any pending timeout
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
      }

      source.onended = () => {
        const idx = activeSourcesRef.current.indexOf(source);
        if (idx !== -1) {
          activeSourcesRef.current.splice(idx, 1);
        }
        if (activeSourcesRef.current.length === 0) {
          // Add a gentle grace period before reverting to listening/idle
          speakingTimerRef.current = setTimeout(() => {
            if (activeSourcesRef.current.length === 0) {
              isSpeakingRef.current = false;
              setCompanionState('listening');
            }
          }, 350);
        }
      };
    } catch (err) {
      console.error('Error playing audio chunk:', err);
    }
  }, []);

  // Update real-time audio levels for visualizer
  useEffect(() => {
    const updateLevels = () => {
      // User Mic Level
      if (userAnalyserRef.current && !isMicMutedRef.current) {
        const data = new Uint8Array(userAnalyserRef.current.frequencyBinCount);
        userAnalyserRef.current.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
        }
        const avg = sum / data.length / 255;
        setUserAudioLevel(Math.min(1, avg * 2.2));
      } else {
        setUserAudioLevel(0);
      }

      // Model Speech Level
      if (modelAnalyserRef.current && isSpeakingRef.current) {
        const data = new Uint8Array(modelAnalyserRef.current.frequencyBinCount);
        modelAnalyserRef.current.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
        }
        const avg = sum / data.length / 255;
        setModelAudioLevel(Math.min(1, avg * 2.5));
      } else {
        setModelAudioLevel(0);
      }

      animFrameRef.current = requestAnimationFrame(updateLevels);
    };

    animFrameRef.current = requestAnimationFrame(updateLevels);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Initialize microphone input stream (16kHz PCM)
  const startMicCapture = useCallback(async () => {
    try {
      if (mediaStreamRef.current) {
        return; // already active
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.4;
      userAnalyserRef.current = analyser;

      // ScriptProcessorNode to capture 16kHz PCM
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMicMutedRef.current) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Don't send absolute silence if no sound
        const int16Array = float32ToInt16(inputData);
        const base64Audio = arrayBufferToBase64(int16Array.buffer);

        wsRef.current.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Audio,
          })
        );
      };

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      console.warn('Microphone permission issue or unavailable:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone access was denied. Please allow microphone permissions in your browser to speak with Serenade.'
          : 'Could not access microphone. You can still chat by typing below.'
      );
    }
  }, []);

  // Stop mic capture
  const stopMicCapture = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (userAnalyserRef.current) {
      userAnalyserRef.current.disconnect();
      userAnalyserRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
  }, []);

  // Connect to the WebSocket Live session
  const connect = useCallback(async () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionStatus('connecting');
    setErrorMessage(null);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      setConnectionStatus('connected');
      setCompanionState('listening');

      // Send initial start configuration
      ws.send(
        JSON.stringify({
          type: 'start',
          language: langRef.current,
          voice: voiceRef.current,
        })
      );

      // Start capturing mic
      await startMicCapture();
    };

    let serenadeAccumulatedText = '';
    let userAccumulatedText = '';

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'ready') {
          setConnectionStatus('connected');
          setCompanionState('listening');
        }

        if (msg.type === 'audio' && msg.audio) {
          playAudioChunk(msg.audio);
        }

        if (msg.type === 'interrupted') {
          stopAllAudio();
          if (serenadeAccumulatedText.trim()) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: 'serenade',
                text: serenadeAccumulatedText.trim() + ' ...',
                timestamp: new Date(),
                isLiveTranscript: true,
              },
            ]);
            serenadeAccumulatedText = '';
          }
          setStreamingTranscript(null);
        }

        if (msg.type === 'modelText' || msg.type === 'modelTranscription') {
          serenadeAccumulatedText += (serenadeAccumulatedText ? ' ' : '') + msg.text;
          setStreamingTranscript({ sender: 'serenade', text: serenadeAccumulatedText });
        }

        if (msg.type === 'userTranscription') {
          userAccumulatedText += (userAccumulatedText ? ' ' : '') + msg.text;
          setStreamingTranscript({ sender: 'user', text: userAccumulatedText });
        }

        if (msg.type === 'turnComplete') {
          if (userAccumulatedText.trim()) {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() - 1).toString(),
                sender: 'user',
                text: userAccumulatedText.trim(),
                timestamp: new Date(),
                isLiveTranscript: true,
              },
            ]);
            userAccumulatedText = '';
          }
          if (serenadeAccumulatedText.trim()) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: 'serenade',
                text: serenadeAccumulatedText.trim(),
                timestamp: new Date(),
                isLiveTranscript: true,
              },
            ]);
            serenadeAccumulatedText = '';
          }
          setStreamingTranscript(null);
        }

        if (msg.type === 'error') {
          console.warn('Live API message warning/error:', msg.message);
          setErrorMessage(msg.message);
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      setCompanionState('idle');
      stopMicCapture();
      stopAllAudio();
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setConnectionStatus('error');
      setErrorMessage('Could not connect to Live voice service. You can use text chat or reconnect.');
    };
  }, [playAudioChunk, startMicCapture, stopAllAudio, stopMicCapture]);

  // Disconnect voice session
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'end' }));
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    stopMicCapture();
    stopAllAudio();
    setConnectionStatus('disconnected');
    setCompanionState('idle');
  }, [stopAllAudio, stopMicCapture]);

  // Update language or voice on the live connection
  const updateConfig = useCallback((newLang: string, newVoice: string) => {
    langRef.current = newLang;
    voiceRef.current = newVoice;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'changeConfig',
          language: newLang,
          voice: newVoice,
        })
      );
    }
  }, []);

  // Send a text message to Serenade (via Live WebSocket or REST fallback)
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setCompanionState('thinking');

      // If live WebSocket is connected, send directly through Live API
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'text',
            text: text.trim(),
          })
        );
        return;
      }

      // Otherwise fallback to REST /api/chat
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            language: langRef.current,
            history: messages.slice(-10).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'model',
              text: m.text,
            })),
          }),
        });
        const data = await res.json();
        if (data.reply) {
          const modelMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'serenade',
            text: data.reply,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, modelMsg]);

          // Optional gentle spoken voice preview
          try {
            const ttsRes = await fetch('/api/speak', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: data.reply, voice: voiceRef.current }),
            });
            const ttsData = await ttsRes.json();
            if (ttsData.audio) {
              const audio = new Audio(`data:audio/wav;base64,${ttsData.audio}`);
              audio.play().catch(() => {});
            }
          } catch (ttsErr) {
            // silent ignore
          }
        }
      } catch (err: any) {
        console.error('REST chat error:', err);
        setErrorMessage('Failed to send text message. Please try again.');
      } finally {
        setCompanionState('idle');
      }
    },
    [messages]
  );

  const toggleMicMute = useCallback(() => {
    setIsMicMuted((prev) => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    companionState,
    isMicMuted,
    errorMessage,
    messages,
    streamingTranscript,
    userAudioLevel,
    modelAudioLevel,
    connect,
    disconnect,
    updateConfig,
    sendTextMessage,
    toggleMicMute,
    clearMessages,
    stopAllAudio,
  };
}
