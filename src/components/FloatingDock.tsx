import React, { useEffect, useState } from 'react';

interface FloatingDockProps {
  onReferenceClick: () => void;
}

// Analyze was removed from here entirely. It only ever fired on the very
// first scan of a session - Dashboard's tap-to-scan card and the Results
// page's "Scan Another Sample" button each already trigger analysis
// directly and instantly, so a separate confirm-then-Analyze step in the
// dock had nothing left to do and would sit disabled forever after the
// first scan. The dock is now purely secondary/utility actions, consistent
// on every page: settings and the pathogen reference lookup.
export const FloatingDock: React.FC<FloatingDockProps> = ({ onReferenceClick }) => {
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
        className="fixed inset-x-0 z-50 mx-auto flex w-[180px] items-center justify-between rounded-full border border-white/60 bg-white/80 px-2 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
      >
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings and accessibility"
          className="flex flex-1 flex-col items-center gap-1 py-1 text-slate-500 transition active:scale-95 dark:text-zinc-400"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="truncate text-[9px] font-bold uppercase tracking-wide">Settings</span>
        </button>

        <div className="h-8 w-px shrink-0 bg-slate-200 dark:bg-zinc-700" />

        <button
          type="button"
          onClick={onReferenceClick}
          aria-label="Pathogen reference guide"
          className="flex flex-1 flex-col items-center gap-1 py-1 text-slate-500 transition active:scale-95 dark:text-zinc-400"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </span>
          <span className="truncate text-[9px] font-bold uppercase tracking-wide">Reference</span>
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
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">Settings & Accessibility</h2>

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