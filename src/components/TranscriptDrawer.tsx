import { useRef, useEffect } from 'react';
import { MessageSquare, X, Trash2, Copy, Check, Sparkles, Volume2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { useState } from 'react';

interface TranscriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  streamingTranscript: { sender: 'user' | 'serenade'; text: string } | null;
  onClear: () => void;
  onSpeakMessage?: (text: string) => void;
}

export function TranscriptDrawer({
  isOpen,
  onClose,
  messages,
  streamingTranscript,
  onClear,
  onSpeakMessage,
}: TranscriptDrawerProps) {
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, streamingTranscript]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const formatted = messages
      .map((m) => `${m.sender === 'user' ? 'You' : 'Serenade'} (${new Date(m.timestamp).toLocaleTimeString()}): ${m.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-white text-sm">Conversation Transcript</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {messages.length} turns
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <>
                <button
                  onClick={handleCopy}
                  title="Copy full transcript"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClear}
                  title="Clear conversation"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          {messages.length === 0 && !streamingTranscript ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mb-1" />
              <p className="text-sm font-medium text-slate-400">No voice conversation yet</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Tap the radiant orb or speak into your microphone to begin our soothing conversation.
              </p>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-medium text-slate-400">
                      {m.sender === 'user' ? 'You' : 'Serenade'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`group relative max-w-[88%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tr-xs shadow-md'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-xs shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {m.sender === 'serenade' && onSpeakMessage && (
                      <button
                        onClick={() => onSpeakMessage(m.text)}
                        title="Replay softly"
                        className="opacity-0 group-hover:opacity-100 transition absolute -bottom-2 -right-2 p-1 rounded-full bg-slate-700 border border-slate-600 text-slate-300 hover:text-white"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming active transcript bubble */}
              {streamingTranscript && (
                <div
                  className={`flex flex-col ${
                    streamingTranscript.sender === 'user' ? 'items-end' : 'items-start'
                  } animate-pulse`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-medium text-amber-300">
                      {streamingTranscript.sender === 'user' ? 'You (speaking...)' : 'Serenade (speaking...)'}
                    </span>
                  </div>
                  <div
                    className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed border ${
                      streamingTranscript.sender === 'user'
                        ? 'bg-amber-900/40 border-amber-500/40 text-amber-100 rounded-tr-xs'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-100 rounded-tl-xs'
                    }`}
                  >
                    <p className="italic">{streamingTranscript.text}</p>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
