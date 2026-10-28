import { useState, useEffect, useRef } from 'react';
import { CloudRain, Waves, Flame, Bell, VolumeX, Volume2, Sliders } from 'lucide-react';
import { AmbientSoundType } from '../types';
import { AmbientSoundGenerator } from '../utils/audio';

const AMBIENT_OPTIONS: Array<{
  id: AmbientSoundType;
  name: string;
  desc: string;
  icon: typeof CloudRain;
  color: string;
}> = [
  { id: 'none', name: 'Silence', desc: 'No background sound', icon: VolumeX, color: 'text-slate-400' },
  { id: 'rain', name: 'Spring Rain', desc: 'Gentle raindrops & soft breeze', icon: CloudRain, color: 'text-sky-400' },
  { id: 'waves', name: 'Night Waves', desc: 'Rhythmic, slow ocean swells', icon: Waves, color: 'text-teal-400' },
  { id: 'hearth', name: 'Warm Hearth', desc: 'Subtle fireplace embers', icon: Flame, color: 'text-amber-400' },
  { id: 'zen', name: 'Zen Bowl', desc: 'Harmonic meditative resonance', icon: Bell, color: 'text-purple-400' },
];

export function AmbientSoundPlayer() {
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.3);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const generatorRef = useRef<AmbientSoundGenerator | null>(null);

  useEffect(() => {
    generatorRef.current = new AmbientSoundGenerator();
    return () => {
      if (generatorRef.current) {
        generatorRef.current.stop();
      }
    };
  }, []);

  const handleSelectSound = (soundId: AmbientSoundType) => {
    setCurrentSound(soundId);
    if (!generatorRef.current) return;

    if (soundId === 'none') {
      generatorRef.current.stop();
    } else {
      generatorRef.current.play(soundId);
      generatorRef.current.setVolume(volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (generatorRef.current) {
      generatorRef.current.setVolume(newVol);
    }
  };

  const activeOption = AMBIENT_OPTIONS.find((o) => o.id === currentSound) || AMBIENT_OPTIONS[0];
  const IconComponent = activeOption.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
          currentSound !== 'none'
            ? 'bg-slate-800/90 border-teal-500/40 text-teal-200'
            : 'bg-slate-850/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
        }`}
        title="Ambient background soundscapes"
      >
        <IconComponent className={`w-3.5 h-3.5 ${activeOption.color}`} />
        <span>{activeOption.name}</span>
        {currentSound !== 'none' && (
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        )}
      </button>

      {/* Floating Settings Popover */}
      {showPanel && (
        <div className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto z-40 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-4 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" /> Peaceful Soundscapes
            </span>
            <button
              onClick={() => setShowPanel(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          {/* Sound options */}
          <div className="space-y-1.5">
            {AMBIENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = currentSound === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectSound(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition border ${
                    isSelected
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-100'
                      : 'bg-slate-800/30 border-transparent hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${opt.color}`} />
                    <div>
                      <div className="text-xs font-medium">{opt.name}</div>
                      <div className="text-[10px] text-slate-400">{opt.desc}</div>
                    </div>
                  </div>
                  {isSelected && <span className="text-xs text-teal-400 font-bold">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          {currentSound !== 'none' && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-slate-400" /> Ambience Volume
                </span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-teal-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
