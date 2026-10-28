import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Server-side Google GenAI initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_SYSTEM_PROMPT = `Role: You are a warm, supportive, and gentle personal companion and assistant. 

Tone & Vocal Style: Speak in a soft, smooth, and deeply friendly manner. Your conversational pace should be calm, reassuring, and natural—optimized for a soothing voice output. Avoid sounding robotic, rushed, or overly formal. Use comforting, conversational phrasing.

Language Behavior: Fluidly converse in the user's currently selected local language [Insert Selected Language Variable Here]. Match their regional idioms, warmth, and colloquialisms naturally while maintaining your gentle, soft-spoken cadence. 

Behavior & Scope: Be ready to help with any question or task thrown your way with patience and genuine care. If a topic is complex, break it down simply and calmly. Always prioritize making the user feel heard, supported, and completely at ease.`;

function buildSystemInstruction(language: string = 'English') {
  return DEFAULT_SYSTEM_PROMPT.replace('[Insert Selected Language Variable Here]', language);
}

// REST endpoints for fallback / text chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'English', history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = buildSystemInstruction(language);

    // Build contents from history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const h of history) {
      if (h.role === 'user' || h.role === 'model') {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let reply = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });
        if (response.text) {
          reply = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} unavailable, trying next...`);
      }
    }

    if (!reply) {
      reply = "I'm right here with you listening gently. Take a soft, slow breath with me while we pause for a quiet moment. I'm listening—tell me more about how you're feeling.";
    }

    res.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    // Even on error, comfort the user with gentle reassurance
    res.json({
      reply: "I'm right here beside you. Take a comfortable, calming breath. Please tell me whatever is on your mind, I am listening.",
    });
  }
});

// REST endpoint for optional TTS of a calm message (using gemini-3.8-flash-lite-tts)
app.post('/api/speak', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Soft, gentle, warm, comforting and soothing companion voice',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned' });
    }

    res.json({ audio: base64Audio, mimeType: 'audio/wav' });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error?.message || 'Failed to synthesize speech' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasKey: !!process.env.GEMINI_API_KEY });
});

// WebSocket Server for Gemini 3.8 Live API real-time voice streaming
const wss = new WebSocketServer({ noServer: true });

// Fallback WebSocket server to gracefully accept Vite client connections without socket drops
const fallbackWss = new WebSocketServer({
  noServer: true,
  handleProtocols: (protocols) => {
    if (protocols.has('vite-hmr')) {
      return 'vite-hmr';
    }
    return Array.from(protocols)[0] || false;
  },
});
fallbackWss.on('connection', (ws) => {
  try {
    ws.send(JSON.stringify({ type: 'connected' }));
  } catch (e) {}
});

server.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      fallbackWss.handleUpgrade(request, socket, head, (ws) => {
        fallbackWss.emit('connection', ws, request);
      });
    }
  } catch (e) {
    socket.destroy();
  }
});

wss.on('connection', (clientWs: WebSocket) => {
  let session: any = null;
  let isClosing = false;
  let currentLanguage = 'English';
  let currentVoice = 'Kore';

  const sendToClient = (obj: any) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify(obj));
    }
  };

  const initSession = async (language: string, voice: string) => {
    try {
      if (session) {
        try {
          session.close();
        } catch (e) {
          // ignore
        }
        session = null;
      }

      currentLanguage = language;
      currentVoice = voice;

      const systemInstruction = buildSystemInstruction(currentLanguage);

      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: currentVoice || 'Kore' },
            },
          },
          systemInstruction,
          // Transcriptions support
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            try {
              const serverContent = message.serverContent;
              if (!serverContent) return;

              // Audio chunks
              const parts = serverContent.modelTurn?.parts;
              if (parts) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    sendToClient({
                      type: 'audio',
                      audio: part.inlineData.data,
                    });
                  }
                  if (part.text) {
                    sendToClient({
                      type: 'modelText',
                      text: part.text,
                    });
                  }
                }
              }

              // Interruption notification
              if (serverContent.interrupted) {
                sendToClient({ type: 'interrupted' });
              }

              // Turn complete
              if (serverContent.turnComplete) {
                sendToClient({ type: 'turnComplete' });
              }

              // Transcription outputs if available
              const outputTrans =
                (serverContent as any).outputAudioTranscription?.text ||
                (serverContent as any).outputTranscription?.text;
              if (outputTrans) {
                sendToClient({
                  type: 'modelTranscription',
                  text: outputTrans,
                });
              }

              const inputTrans =
                (serverContent as any).inputAudioTranscription?.text ||
                (serverContent as any).inputTranscription?.text;
              if (inputTrans) {
                sendToClient({
                  type: 'userTranscription',
                  text: inputTrans,
                });
              }
            } catch (err: any) {
              console.error('Error handling LiveServerMessage:', err);
            }
          },
          onclose: () => {
            if (!isClosing) {
              sendToClient({ type: 'sessionClosed' });
            }
          },
          onerror: (err: any) => {
            console.error('Live session error:', err);
            sendToClient({
              type: 'error',
              message: err?.message || 'Live session error',
            });
          },
        },
      });

      sendToClient({ type: 'ready', language: currentLanguage, voice: currentVoice });
    } catch (err: any) {
      console.error('Failed to connect to Live API:', err);
      sendToClient({
        type: 'error',
        message: err?.message || 'Failed to start Live session with Gemini 3.8',
      });
    }
  };

  clientWs.on('message', async (data: Buffer | string) => {
    try {
      const msgStr = data.toString();
      const parsed = JSON.parse(msgStr);

      if (parsed.type === 'start') {
        await initSession(parsed.language || 'English', parsed.voice || 'Kore');
        return;
      }

      if (parsed.type === 'changeConfig') {
        await initSession(parsed.language || currentLanguage, parsed.voice || currentVoice);
        return;
      }

      if (parsed.type === 'audio' && parsed.audio) {
        if (!session) {
          // Auto initialize if not yet started
          await initSession(currentLanguage, currentVoice);
        }
        if (session) {
          session.sendRealtimeInput({
            audio: {
              data: parsed.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
        return;
      }

      if (parsed.type === 'text' && parsed.text) {
        if (!session) {
          await initSession(currentLanguage, currentVoice);
        }
        if (session) {
          session.sendRealtimeInput({
            text: parsed.text,
          });
        }
        return;
      }

      if (parsed.type === 'end') {
        if (session) {
          session.close();
          session = null;
        }
        return;
      }
    } catch (err: any) {
      console.error('Error processing client message:', err);
    }
  });

  clientWs.on('close', () => {
    isClosing = true;
    if (session) {
      try {
        session.close();
      } catch (e) {
        // ignore
      }
      session = null;
    }
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, () => {
    console.log(`Serenade Voice Companion server running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
