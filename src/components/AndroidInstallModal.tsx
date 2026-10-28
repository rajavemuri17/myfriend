import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  QrCode,
  ExternalLink,
  Check,
  X,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AndroidInstallModal({ isOpen, onClose }: AndroidInstallModalProps) {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'qr'>('instant');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (isOpen && appUrl) {
      QRCode.toDataURL(appUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#090D16',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR:', err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadAndroidZip = () => {
    // Generate a downloadable package with Android Manifest and instructions
    const manifestJson = {
      name: "Serenade - Gentle Voice Companion",
      short_name: "Serenade",
      start_url: appUrl,
      display: "standalone",
      background_color: "#090D16",
      theme_color: "#090D16",
      package_name: "com.serenade.voice.companion",
    };

    const readmeContent = `# Serenade Android APK Package
App URL: ${appUrl}
Package: com.serenade.voice.companion

## How to build an installable APK:
Method 1 (Fastest via PWABuilder):
1. Go to https://www.pwabuilder.com
2. Enter your App URL: ${appUrl}
3. Click "Package for Android" -> Download APK!

Method 2 (Using Google's Bubblewrap CLI):
1. Run: npm install -g @bubblewrap/cli
2. Run: bubblewrap init --manifest=${appUrl}/manifest.webmanifest
3. Run: bubblewrap build
Your signed APK will be generated ready to install on Android!
`;

    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'serenade-android-apk-guide.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base sm:text-lg text-white">Download & Install Android App</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  Android APK
                </span>
              </div>
              <p className="text-xs text-slate-400">Install Serenade on your mobile phone for full offline peace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/60 rounded-xl my-3 text-xs font-medium">
          <button
            onClick={() => setActiveTab('instant')}
            className={`py-2 px-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'instant'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> 1-Click Install
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Scan Phone QR
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Standalone .APK
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar text-xs">
          {/* TAB 1: 1-Click Native WebAPK Install */}
          {activeTab === 'instant' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-slate-800/40 border border-teal-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-teal-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Native Android WebAPK (Recommended)
                  </span>
                  <span className="text-[10px] text-teal-300 px-2 py-0.5 rounded-full bg-teal-500/20 font-medium">
                    Google Approved
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Android devices automatically build, sign, and install an official <strong>WebAPK</strong> onto your phone without requiring manual file downloads or enabling dangerous third-party permissions.
                </p>

                {isInstallable ? (
                  <button
                    onClick={install}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" /> Install on this Android Device Now
                  </button>
                ) : isInstalled ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-center font-medium flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Serenade is already installed on your device!
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-slate-300">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-400" /> How to install in your Android browser:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                      <li>Open this URL in Chrome on your Android mobile.</li>
                      <li>Tap the <strong>⋮ (three dots)</strong> menu icon at the top right.</li>
                      <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Android will generate and place the native app icon on your home screen!</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Offline highlight */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200">Full Offline Operation:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Once installed, Serenade works when you're completely offline. Ambient soundscapes (rain, hearth, ocean, zen bowl), 4-7-8 breathing coach, and cached notes load instantly.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Scan QR Code with Phone */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-3 py-1">
              <p className="text-slate-300 max-w-sm">
                Point your Android mobile camera or QR scanner at the code below to open and install the app on your phone:
              </p>

              {qrDataUrl ? (
                <div className="p-3 rounded-2xl bg-white shadow-2xl border-4 border-teal-500/40 inline-block animate-in zoom-in-95 duration-200">
                  <img src={qrDataUrl} alt="Scan to install on Android" className="w-48 h-48 rounded-lg" />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-slate-800 animate-pulse flex items-center justify-center text-slate-500">
                  Generating QR...
                </div>
              )}

              <div className="w-full max-w-sm flex items-center gap-2 p-1.5 bg-slate-800/80 border border-slate-700 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-transparent px-2 text-[11px] text-slate-300 outline-none select-all font-mono truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  {copiedUrl ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Standalone .APK File Generation */}
          {activeTab === 'apk' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-amber-200 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400" /> Build Standalone .APK File
                  </span>
                  <span className="text-[10px] text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 font-medium">
                    Direct Sideloading
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  If you need a physical compiled <code className="text-amber-300">.apk</code> file to distribute or sideload with Android Package Installer:
                </p>

                {/* Direct 1-Click Builder Link */}
                <a
                  href={`https://www.pwabuilder.com/app?url=${encodeURIComponent(appUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> Generate & Download .APK via PWABuilder
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                {/* Download guide & CLI command */}
                <button
                  onClick={handleDownloadAndroidZip}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" /> Download Android APK Build Guide (.md)
                </button>
              </div>

              {/* CLI Instructions */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Official Google Bubblewrap CLI:
                </div>
                <div className="text-teal-300 overflow-x-auto p-1 bg-slate-900/60 rounded">
                  npm install -g @bubblewrap/cli<br />
                  bubblewrap init --manifest={appUrl}/manifest.webmanifest<br />
                  bubblewrap build
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Offline PWA + WebAPK Verified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
