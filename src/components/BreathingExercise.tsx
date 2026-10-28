import { useState, useEffect } from 'react';
import { Wind, X, Play, RotateCcw } from 'lucide-react';

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

export function BreathingExercise({ isOpen, onClose }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [timer, setTimer] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setPhase('idle');
      setTimer(4);
      setCycleCount(0);
      return;
    }

    if (phase === 'idle') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 7;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 8;
          } else if (phase === 'exhale') {
            setCycleCount((c) => c + 1);
            setPhase('inhale');
            return 4;
          }
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, phase]);

  if (!isOpen) return null;

  const handleStart = () => {
    setPhase('inhale');
    setTimer(4);
    setCycleCount(0);
  };

  const handleReset = () => {
    setPhase('idle');
    setTimer(4);
    setCycleCount(0);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in gently through your nose...';
      case 'hold':
        return 'Hold your breath gently and softly...';
      case 'exhale':
        return 'Release your breath slowly and completely...';
      default:
        return 'Take a comfortable posture and press begin.';
    }
  };

  const getCircleScale = () => {
    if (phase === 'inhale') return 'scale-125 duration-[4000ms]';
    if (phase === 'hold') return 'scale-125 duration-[7000ms]';
    if (phase === 'exhale') return 'scale-75 duration-[8000ms]';
    return 'scale-100 duration-1000';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-teal-400 mb-1">
          <Wind className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Mindful 4-7-8 Breath</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-6">Rest & Center Yourself</h3>

        {/* Breathing Orb Visualization */}
        <div className="relative w-56 h-56 flex items-center justify-center my-4">
          <div
            className={`absolute w-44 h-44 rounded-full bg-gradient-to-tr from-teal-500/30 to-indigo-500/30 blur-xl transition-all ease-in-out ${getCircleScale()}`}
          />
          <div
            className={`w-36 h-36 rounded-full border-2 border-teal-400/60 bg-gradient-to-tr from-teal-500/20 to-sky-500/20 shadow-inner flex flex-col items-center justify-center transition-all ease-in-out ${getCircleScale()}`}
          >
            {phase !== 'idle' ? (
              <>
                <span className="text-4xl font-light text-teal-200 tracking-tighter">{timer}</span>
                <span className="text-xs font-medium uppercase tracking-wider text-teal-300 mt-1">
                  {phase}
                </span>
              </>
            ) : (
              <Wind className="w-10 h-10 text-teal-300 opacity-80" />
            )}
          </div>
        </div>

        <p className="text-sm text-slate-300 font-medium h-10 px-4 mt-2 transition-all">
          {getPhaseInstruction()}
        </p>

        {cycleCount > 0 && (
          <div className="text-xs text-slate-400 mt-1">
            Cycles completed: <span className="text-teal-300 font-semibold">{cycleCount}</span>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6 w-full">
          {phase === 'idle' ? (
            <button
              onClick={handleStart}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
            >
              <Play className="w-4 h-4" /> Start Calming Breath
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
