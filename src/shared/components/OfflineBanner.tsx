'use client';

import React from 'react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-accent-amber text-slate-900 text-center py-1.5 text-xs font-semibold tracking-wide">
      Working offline. You are viewing cached information.
    </div>
  );
}
