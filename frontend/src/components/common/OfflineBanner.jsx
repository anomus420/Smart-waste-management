import { useState, useEffect } from 'react';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <aside
      aria-label="Network status banner"
      className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-xs md:text-sm font-medium text-center shadow-md transition-all duration-300 backdrop-blur-md ${
        isOffline
          ? 'bg-amber-500/90 text-slate-900 border-b border-amber-600'
          : 'bg-emerald-600/90 text-white border-b border-emerald-700'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        {isOffline ? (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-950 animate-pulse" />
            <span>You are currently offline. Cached data and pages remain accessible.</span>
          </>
        ) : (
          <>
            <span>🟢 Back online! Content synced.</span>
          </>
        )}
      </div>
    </aside>
  );
};

export default OfflineBanner;
