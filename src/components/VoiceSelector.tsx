import { useState } from 'react';
import { Volume2, Check, Sparkles, Loader2 } from 'lucide-react';
import { VoiceOption } from '../types';

export const GEMINI_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    style: 'Warm & Velvety (Recommended)',
    description: 'Deeply comforting, gentle, and maternal/paternal warmth. Ideal for soothing relaxation.',
    color: 'from-amber-500 to-rose-400',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    style: 'Airy & Serene',
    description: 'Light, peaceful, whisper-soft cadence that calms anxious thoughts.',
    color: 'from-sky-400 to-teal-300',
  },
  {
    id: 'Puck',
    name: 'Puck',
    style: 'Gentle & Friendly',
    description: 'Upbeat yet tender and conversational, like an empathetic best friend.',
    color: 'from-emerald-400 to-amber-300',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    style: 'Deep & Grounding',
    description: 'A low, reassuring, resonant presence that anchors your mood.',
    color: 'from-indigo-400 to-purple-400',
  },
  {
    id: 'Charon',
    name: 'Charon',
    style: 'Tranquil & Meditative',
    description: 'Slow-paced, thoughtful, and contemplative cadence for mindful reflection.',
    color: 'from-purple-400 to-pink-400',
  },
];

interface VoiceSelectorProps {
  currentVoice: string;
  onSelectVoice: (voiceId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSelector({ currentVoice, onSelectVoice, isOpen, onClose }: VoiceSelectorProps) {
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreview = async (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation();
    try {
      setPreviewingVoice(voiceId);
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Hello there. I am your companion with the ${voiceId} voice. I'm right here with you.`,
          voice: voiceId,
        }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        await audio.play();
      }
    } catch (err) {
      console.error('Failed to preview voice:', err);
    } finally {
      setPreviewingVoice(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Vocal Tone & Persona</h3>
              <p className="text-xs text-slate-400">Powered by Gemini 3.8 Live API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {GEMINI_VOICES.map((v) => {
            const isSelected = currentVoice.toLowerCase() === v.id.toLowerCase();
            const isPreviewing = previewingVoice === v.id;
            return (
              <div
                key={v.id}
                onClick={() => {
                  onSelectVoice(v.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500/50 shadow-md'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${v.color}`} />
                    <span className="font-semibold text-sm text-white">{v.name}</span>
                    <span className="text-xs text-rose-300 font-medium px-2 py-0.5 rounded-full bg-rose-500/20">
                      {v.style}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handlePreview(e, v.id)}
                      disabled={isPreviewing}
                      title="Preview this gentle voice"
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
                    >
                      {isPreviewing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-300" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-rose-300" />
                      )}
                    </button>
                    {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{v.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
