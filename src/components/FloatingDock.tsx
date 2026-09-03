import React, { useEffect, useState } from 'react';

interface FloatingDockProps {
  onCameraClick: () => void;
  onUploadClick: () => void;
  onAnalyzeClick?: () => void;
  isReady?: boolean;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ onCameraClick, onUploadClick, onAnalyzeClick, isReady }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-[280px] -translate-x-1/2 items-center justify-between rounded-full bg-white px-6 py-2.5 shadow-xl border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900">
      
      <button onClick={() => setIsDark(!isDark)} className="flex w-12 flex-col items-center gap-1 text-slate-500 transition active:scale-95 dark:text-zinc-400">
        {isDark ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">{isDark ? 'Light' : 'Dark'}</span>
      </button>

      {isReady ? (
        <button onClick={onAnalyzeClick} className="flex flex-col items-center gap-1 transition active:scale-95">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#006837] text-white shadow-lg ring-4 ring-[#006837]/20">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#006837] dark:text-emerald-500">Analyze</span>
        </button>
      ) : (
        <button onClick={onCameraClick} className="flex flex-col items-center gap-1 transition active:scale-95">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#006837] text-white shadow-md">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#006837] dark:text-emerald-500">Camera</span>
        </button>
      )}

      <button onClick={onUploadClick} className="flex w-12 flex-col items-center gap-1.5 text-slate-500 transition active:scale-95 dark:text-zinc-400">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">Upload</span>
      </button>
      
    </div>
  );
};