import React, { useEffect, useState } from 'react';

interface FloatingDockProps {
  onCameraClick: () => void;
  onUploadClick: () => void;
  onAnalyzeClick?: () => void;
  isReady?: boolean;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ onCameraClick, onUploadClick, onAnalyzeClick, isReady }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pathoscan-dark') === 'true');
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('pathoscan-reduce-motion') === 'true');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('pathoscan-large-text') === 'true');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('pathoscan-dark', String(isDark));
  }, [isDark]);

  useEffect(() => {
    document.documentElement.classList.toggle('motion-reduce', reduceMotion);
    localStorage.setItem('pathoscan-reduce-motion', String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? '18px' : '';
    localStorage.setItem('pathoscan-large-text', String(largeText));
  }, [largeText]);

  return (
    <>
      <div
        className="fixed inset-x-0 z-50 mx-auto flex w-[260px] items-end justify-between rounded-[28px] border border-white/60 bg-white/75 px-3 pb-2.5 pt-2 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
      >
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings and accessibility"
          className="flex min-w-0 flex-col items-center gap-1 text-slate-500 transition active:scale-95 dark:text-zinc-400"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="truncate text-[9px] font-bold uppercase tracking-wide">More</span>
        </button>

        {isReady ? (
          <button type="button" onClick={onAnalyzeClick} aria-label="Analyze specimen" className="flex min-w-0 flex-col items-center gap-1 transition active:scale-95">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#006837] text-white shadow-lg ring-4 ring-[#006837]/20">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#006837] dark:text-emerald-500">Analyze</span>
          </button>
        ) : (
          <button type="button" onClick={onCameraClick} aria-label="Open camera" className="flex min-w-0 flex-col items-center gap-1 transition active:scale-95">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#006837] text-white shadow-md">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#006837] dark:text-emerald-500">Scan</span>
          </button>
        )}

        <button
          type="button"
          onClick={onUploadClick}
          aria-label="Upload from gallery"
          className="flex min-w-0 flex-col items-center gap-1 text-slate-500 transition active:scale-95 dark:text-zinc-400"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </span>
          <span className="truncate text-[9px] font-bold uppercase tracking-wide">Gallery</span>
        </button>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/40" onClick={() => setSettingsOpen(false)}>
          <div
            className="w-full rounded-t-lg bg-white p-6 dark:bg-zinc-900"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">Settings &amp; Accessibility</h2>

            <div className="flex flex-col gap-2">
              <SettingRow
                label="Dark Mode"
                checked={isDark}
                onChange={setIsDark}
                icon={isDark ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                )}
              />
              <SettingRow
                label="Larger Text"
                checked={largeText}
                onChange={setLargeText}
                icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" /></svg>}
              />
              <SettingRow
                label="Reduce Motion"
                checked={reduceMotion}
                onChange={setReduceMotion}
                icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M8 12h8" /></svg>}
              />
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="mt-6 w-full rounded-lg bg-slate-100 py-3 text-sm font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

function SettingRow({ label, checked, onChange, icon }: { label: string; checked: boolean; onChange: (v: boolean) => void; icon?: React.ReactNode }) {
  const trackClass = checked
    ? "relative h-7 w-12 shrink-0 rounded-full bg-[#006837] transition-colors duration-200"
    : "relative h-7 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-zinc-600 transition-colors duration-200";

  const knobClass = checked
    ? "absolute top-1 left-6 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200"
    : "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200";

  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3.5 dark:bg-zinc-800/60">
      <div className="flex items-center gap-3 text-slate-700 dark:text-zinc-200">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#006837] shadow-sm dark:bg-zinc-900 dark:text-emerald-500">
          {icon}
        </span>
        <span className="text-[13px] font-bold">{label}</span>
      </div>

      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={trackClass}>
        <span className={knobClass} />
      </button>
    </div>
  );
}