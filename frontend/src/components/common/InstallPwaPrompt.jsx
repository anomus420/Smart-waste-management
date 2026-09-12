import { useState, useEffect } from 'react';

const InstallPwaPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if user dismissed prompt recently (within 3 days)
    const dismissedAt = localStorage.getItem('pwa_install_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        setIsDismissed(true);
      }
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    // Check if running inside Safari browser (not Chrome on iOS or standalone)
    const isSafari = /safari/.test(userAgent) && !/crios|fxios/.test(userAgent);
    if (isIosDevice && isSafari) {
      setIsIOS(true);
    }

    // 4. Capture beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };

  // Do not show if already installed, dismissed, or unsupported
  if (isInstalled || isDismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      {/* Floating Install Bar (bottom right) */}
      <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/30 p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-2xl">♻️</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Install SmartWaste App
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
              Add to your home screen for quick offline access and instant civic updates.
            </p>

            <div className="mt-3 flex items-center gap-2">
              {isIOS ? (
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  How to Install
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install Now
                </button>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base leading-none p-1"
            aria-label="Close prompt"
          >
            &times;
          </button>
        </div>
      </div>

      {/* iOS Step-by-Step Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
            >
              &times;
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl shadow-lg mb-2">
                ♻️
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Install on iPhone or iPad
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Install SmartWaste directly onto your home screen in 3 quick steps:
              </p>
            </div>

            <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>
                  Tap the <strong className="text-slate-900 dark:text-white">Share</strong> icon at the bottom of Safari browser (box with upward arrow <span className="font-semibold">⎋</span>).
                </span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>
                  Scroll down the menu and tap <strong className="text-slate-900 dark:text-white">"Add to Home Screen"</strong> (with a plus icon <span className="font-semibold">⊞</span>).
                </span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>
                  Tap <strong className="text-slate-900 dark:text-white">"Add"</strong> in the top-right corner to complete installation.
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPwaPrompt;
