interface AudioWaveformProps {
  userLevel: number;
  modelLevel: number;
  companionState: 'idle' | 'listening' | 'speaking' | 'thinking';
  isConnected: boolean;
}

export function AudioWaveform({ userLevel, modelLevel, companionState, isConnected }: AudioWaveformProps) {
  const bars = 24;

  const getBarHeight = (index: number) => {
    if (!isConnected) return 4;
    const center = bars / 2;
    const distFromCenter = Math.abs(index - center) / center;
    const bellFactor = Math.cos(distFromCenter * (Math.PI / 2.2));

    if (companionState === 'speaking') {
      const wobble = Math.sin(index * 0.8 + Date.now() * 0.008) * 0.3 + 0.7;
      return Math.max(6, Math.min(36, modelLevel * 45 * bellFactor * wobble));
    }
    if (companionState === 'listening') {
      const wobble = Math.cos(index * 0.7 + Date.now() * 0.006) * 0.3 + 0.7;
      return Math.max(5, Math.min(32, userLevel * 40 * bellFactor * wobble));
    }
    // Idle soft subtle motion
    return 4 + Math.sin(index * 0.5 + Date.now() * 0.002) * 2;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4 py-2">
      {Array.from({ length: bars }).map((_, i) => {
        const height = getBarHeight(i);
        return (
          <div
            key={i}
            style={{
              height: `${height}px`,
              transition: 'height 0.08s ease-out',
            }}
            className={`w-1 rounded-full ${
              companionState === 'speaking'
                ? 'bg-gradient-to-t from-pink-500 to-rose-300'
                : companionState === 'listening'
                ? 'bg-gradient-to-t from-amber-500 to-teal-300'
                : 'bg-slate-600/40'
            }`}
          />
        );
      })}
    </div>
  );
}
