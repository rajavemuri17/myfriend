import { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  RadioTower,
  MessageSquare,
  Globe,
  Sparkles,
  Wind,
  Send,
  AlertCircle,
  VolumeX,
} from 'lucide-react';
import { useLiveVoice } from './hooks/useLiveVoice';
import { SerenadeOrb } from './components/SerenadeOrb';
import { AudioWaveform } from './components/AudioWaveform';
import { LanguageSelector } from './components/LanguageSelector';
import { VoiceSelector } from './components/VoiceSelector';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { BreathingExercise } from './components/BreathingExercise';
import { TranscriptDrawer } from './components/TranscriptDrawer';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthBar } from './components/AuthBar';
import { auth, saveConversationTurn } from './lib/firebase';

const COMFORT_STARTERS = [
  { label: 'Had an overwhelming day', text: "I've had an overwhelming day, and I just need someone kind to listen to me." },
  { label: 'Calm racing thoughts', text: 'Can you help me calm my racing thoughts and feel grounded?' },
  { label: 'Soothing bedtime story', text: 'Tell me a gentle, soothing bedtime story to help me drift off peacefully.' },
  { label: 'Break down a tough problem', text: 'I have a complex decision to make. Can you help me break it down simply and calmly?' },
  { label: 'Encouraging reminder', text: 'Can you share a gentle reminder that things are going to be okay?' },
];

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English (US)');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [inputText, setInputText] = useState<string>('');

  // Modals state
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState<boolean>(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);

  // Gemini 3.8 Live API hook
  const {
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
  } = useLiveVoice({
    language: selectedLanguage,
    voice: selectedVoice,
  });

  // Whenever a new message turn is registered, persist it to Firestore if user is authenticated
  useEffect(() => {
    if (messages.length > 0 && auth.currentUser) {
      const last = messages[messages.length - 1];
      saveConversationTurn(auth.currentUser.uid, {
        id: last.id,
        sender: last.sender,
        text: last.text,
        timestamp: last.timestamp instanceof Date ? last.timestamp.toISOString() : new Date().toISOString(),
      }).catch((e) => console.warn('Could not persist turn:', e));
    }
  }, [messages]);

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    updateConfig(newLang, selectedVoice);
  };

  const handleVoiceChange = (newVoice: string) => {
    setSelectedVoice(newVoice);
    updateConfig(selectedLanguage, newVoice);
  };

  const handlePreferencesLoaded = (prefs: { preferredLanguage?: string; preferredVoice?: string }) => {
    if (prefs.preferredLanguage) {
      setSelectedLanguage(prefs.preferredLanguage);
      updateConfig(prefs.preferredLanguage, selectedVoice);
    }
    if (prefs.preferredVoice) {
      setSelectedVoice(prefs.preferredVoice);
      updateConfig(selectedLanguage, prefs.preferredVoice);
    }
  };

  const handleOrbClick = () => {
    if (connectionStatus === 'connected') {
      disconnect();
    } else {
      connect();
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendTextMessage(inputText);
    setInputText('');
  };

  const handlePromptClick = (text: string) => {
    if (connectionStatus !== 'connected') {
      connect().then(() => {
        setTimeout(() => sendTextMessage(text), 600);
      });
    } else {
      sendTextMessage(text);
    }
  };

  const handleSpeakTranscript = async (text: string) => {
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play().catch(() => {});
      }
    } catch (e) {
      console.error('Replay error:', e);
    }
  };

  // Get most recent message for live caption banner
  const lastSerenadeMessage = [...messages].reverse().find((m) => m.sender === 'serenade');

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200 relative overflow-x-hidden">
      {/* Offline Mode Status Banner */}
      <OfflineIndicator />

      {/* Gentle Ambient Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] left-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent blur-[120px]" />
        <div className="absolute top-[35%] -right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-indigo-500/10 via-purple-500/10 to-transparent blur-[130px]" />
        <div className="absolute -bottom-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-teal-500/10 via-sky-500/5 to-transparent blur-[140px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-xl px-3 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/30 via-rose-500/30 to-purple-500/30 border border-white/10 shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-300" />
              {connectionStatus === 'connected' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-semibold text-white tracking-tight text-base sm:text-lg">Serenade</h1>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 hidden md:inline-flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5" /> Gemini 3.8 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Gentle, soothing voice companion</p>
            </div>
          </div>

          {/* Controls & Modalities */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Install Android PWA Button */}
            <PWAInstallButton />

            {/* Ambient Soundscapes (Runs 100% offline) */}
            <AmbientSoundPlayer />

            {/* 4-7-8 Breath Coach (Runs 100% offline) */}
            <button
              onClick={() => setIsBreathingOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
              title="4-7-8 Mindful Breath"
            >
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden lg:inline">Breathe</span>
            </button>

            {/* Language Selector */}
            <button
              onClick={() => setIsLangOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Change local language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[70px] sm:max-w-[110px] truncate">{selectedLanguage}</span>
            </button>

            {/* Voice Tone Selector */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Choose vocal tone"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">{selectedVoice}</span>
            </button>

            {/* Transcript Drawer Toggle */}
            <button
              onClick={() => setIsTranscriptOpen(true)}
              className="relative p-2 rounded-full bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
              title="View transcript & notes"
            >
              <MessageSquare className="w-4 h-4 text-slate-300" />
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 flex items-center justify-center">
                  {messages.length}
                </span>
              )}
            </button>

            {/* Google Sign-in & Firestore Sync Bar */}
            <AuthBar
              currentLanguage={selectedLanguage}
              currentVoice={selectedVoice}
              onPreferencesLoaded={handlePreferencesLoaded}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-3 sm:py-5 flex flex-col items-center justify-between">
        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="w-full max-w-xl mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => connect()}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Center Sanctuary: Living Luminous Orb */}
        <div className="w-full flex flex-col items-center justify-center my-auto">
          {/* Connection Status Pill */}
          <div className="mb-2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-800 text-xs text-slate-400">
            {connectionStatus === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-medium">Live Audio Connected</span>
                <span className="text-slate-600">•</span>
                <span>Voice: {selectedVoice}</span>
                <span className="text-slate-600">•</span>
                <span>{selectedLanguage}</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-sky-300 font-medium">Connecting to Gemini 3.8 Live...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Ready to converse • Tap the orb or button below</span>
              </>
            )}
          </div>

          {/* Interactive Luminous Orb */}
          <SerenadeOrb
            companionState={companionState}
            connectionStatus={connectionStatus}
            userAudioLevel={userAudioLevel}
            modelAudioLevel={modelAudioLevel}
            isMuted={isMicMuted}
            onOrbClick={handleOrbClick}
          />

          {/* Real-time Audio Waveform */}
          <AudioWaveform
            userLevel={userAudioLevel}
            modelLevel={modelAudioLevel}
            companionState={companionState}
            isConnected={connectionStatus === 'connected'}
          />

          {/* Real-time Spoken Caption / Subtitle Card */}
          <div className="w-full max-w-xl min-h-[56px] px-5 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 text-center flex items-center justify-center shadow-lg transition-all">
            {streamingTranscript ? (
              <p className="text-sm font-medium text-amber-200/95 italic animate-in fade-in">
                {streamingTranscript.sender === 'user' ? '“' : 'Serenade: “'}
                {streamingTranscript.text}”
              </p>
            ) : companionState === 'speaking' && lastSerenadeMessage ? (
              <p className="text-sm text-rose-200/90 leading-relaxed line-clamp-2">
                “{lastSerenadeMessage.text}”
              </p>
            ) : connectionStatus === 'connected' ? (
              <p className="text-xs text-slate-400">
                {isMicMuted
                  ? 'Microphone is currently paused. Unmute below or speak whenever ready.'
                  : 'Speak naturally in your cadence. Serenade is listening with gentle care.'}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                A safe, comforting space. Ask anything, share your day, or just rest in quiet presence.
              </p>
            )}
          </div>

          {/* Voice Action Controls */}
          <div className="flex items-center gap-3 mt-4">
            {connectionStatus !== 'connected' ? (
              <button
                onClick={connect}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RadioTower className="w-4 h-4" /> Start Voice Conversation
              </button>
            ) : (
              <>
                {/* Mute Mic */}
                <button
                  onClick={toggleMicMute}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isMicMuted
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Soft pause / Interrupt playback */}
                {companionState === 'speaking' && (
                  <button
                    onClick={stopAllAudio}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    title="Softly pause Serenade's voice"
                  >
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" /> Pause Voice
                  </button>
                )}

                {/* End Voice Session */}
                <button
                  onClick={disconnect}
                  className="px-5 py-2.5 rounded-full bg-slate-800/90 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700/60 text-slate-300 hover:text-rose-200 text-xs font-medium transition cursor-pointer"
                >
                  End Voice Call
                </button>
              </>
            )}
          </div>
        </div>

        {/* Gentle Comfort Starters Carousel */}
        <div className="w-full max-w-2xl my-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2 px-1 text-center">
            Gentle Comfort Prompts
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 justify-start sm:justify-center no-scrollbar">
            {COMFORT_STARTERS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(s.text)}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 text-xs text-slate-300 hover:text-amber-200 transition shadow-sm cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gentle Text Input Bar (Voice & Text dual mode) */}
        <form onSubmit={handleSendText} className="w-full max-w-xl">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={
                connectionStatus === 'connected'
                  ? 'Speak naturally, or type a quiet message here...'
                  : 'Type a message to Serenade or click Start Voice above...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-amber-500/60 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xl backdrop-blur-md transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 p-2 rounded-xl bg-amber-500/90 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500/90 text-slate-950 transition cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Serenade speaks with warm, calm empathy in {selectedLanguage} using voice tone "{selectedVoice}".
          </p>
        </form>
      </main>

      {/* Modals & Drawers */}
      <LanguageSelector
        currentLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageChange}
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />

      <VoiceSelector
        currentVoice={selectedVoice}
        onSelectVoice={handleVoiceChange}
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <BreathingExercise
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <TranscriptDrawer
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        messages={messages}
        streamingTranscript={streamingTranscript}
        onClear={clearMessages}
        onSpeakMessage={handleSpeakTranscript}
      />
    </div>
  );
}
