import { WifiOff, Sparkles } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 max-w-sm rounded-2xl bg-slate-900/95 border border-amber-500/40 p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 text-slate-200">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
          <WifiOff className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            Offline Mode Active
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            Procedural soundscapes (rain, hearth, ocean, zen bowl), 4-7-8 breathing, and your cached reflections remain completely available offline.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-amber-400/90 mt-1.5">
            <Sparkles className="w-3 h-3" /> Real-time live voice reconnects when online.
          </div>
        </div>
      </div>
    </div>
  );
}
