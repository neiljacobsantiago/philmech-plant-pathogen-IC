import React, { useEffect, useState } from 'react';
import { getAllPathogens } from '../db/database';
import { PathogenRecord } from '../db/schema';

interface ReferenceSheetProps {
  onClose: () => void;
}

export const ReferenceSheet: React.FC<ReferenceSheetProps> = ({ onClose }) => {
  const [pathogens, setPathogens] = useState<PathogenRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllPathogens()
      .then((records) => {
        // Alphabetical - IndexedDB's own key order already sorts this way
        // since 'id' (the species name) is the keyPath, but sort explicitly
        // so this doesn't silently depend on that implementation detail.
        setPathogens([...records].sort((a, b) => a.id.localeCompare(b.id)));
      })
      .catch(() => setError('Could not load reference data from local storage.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/40" onClick={onClose}>
      <div
        className="max-h-[85dvh] w-full overflow-y-auto rounded-t-lg bg-white p-6 dark:bg-zinc-900 md:mx-auto md:max-w-2xl md:rounded-lg"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300 dark:bg-zinc-700 md:hidden" />
        <h2 className="mb-1 text-sm font-black uppercase tracking-widest text-slate-400">Pathogen Reference</h2>
        <p className="mb-4 text-[12px] font-medium text-slate-500 dark:text-zinc-400">
          Known 5-7 day, early-to-mature PDA culture characteristics, for manual cross-verification alongside the AI result.
        </p>

        {isLoading && (
          <p className="py-6 text-center text-[12px] font-bold text-slate-400">Loading reference data...</p>
        )}

        {error && (
          <p className="py-6 text-center text-[12px] font-bold text-rose-500">{error}</p>
        )}

        {!isLoading && !error && (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {pathogens.map((p) => (
              <div key={p.id} className="py-4 first:pt-0 last:pb-0">
                <h3 className="mb-2 text-[13px] font-black italic text-[#006837] dark:text-emerald-500">{p.id}</h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Growth Rate</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">{p.growthRate}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Surface Color</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">{p.surfaceColor}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Reverse Color</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">{p.reverseColor}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Texture</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">{p.myceliumTexture}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-100 py-3 text-sm font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};