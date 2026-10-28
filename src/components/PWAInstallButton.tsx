import { useState } from 'react';
import { Smartphone, Check, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidInstallModal } from './AndroidInstallModal';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState<boolean>(false);

  // If already installed, show small subtle badge
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium">
        <Check className="w-3 h-3" /> Android App Active
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowModal(true);
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-teal-500/40 text-teal-200 text-xs font-semibold shadow-sm transition cursor-pointer"
        title="Download APK / Install on Android Mobile Phone"
      >
        <Smartphone className="w-3.5 h-3.5 text-teal-300" />
        <span>{isAndroid ? 'Install on Android' : 'Download .APK / Install'}</span>
      </button>

      <AndroidInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
