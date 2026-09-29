import React, { useEffect, useState } from "react";
import { getAllPathogens } from "../db/database";
import { PathogenRecord } from "../db/schema";

interface ReferenceSheetProps {
  onClose: () => void;
}

/** Cultural-characteristic rows shown per species, in display order. */
const CHARACTERISTIC_FIELDS: {
  label: string;
  key: keyof Omit<PathogenRecord, "id">;
}[] = [
  { label: "Growth Rate", key: "growthRate" },
  { label: "Surface Color", key: "surfaceColor" },
  { label: "Reverse Color", key: "reverseColor" },
  { label: "Texture", key: "myceliumTexture" },
];

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
      .catch((err) => {
        console.error(err);
        setError("Could not load reference data from local storage.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    // Bottom sheet on phones, centred dialog from md up.
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/40 md:items-center md:justify-center md:p-8"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full overflow-y-auto rounded-t-lg bg-white p-6 dark:bg-zinc-900 md:max-h-[88dvh] md:max-w-5xl md:rounded-lg md:p-10 md:shadow-2xl"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300 dark:bg-zinc-700 md:hidden" />
        <h2 className="mb-1 text-sm font-black uppercase tracking-widest text-slate-400">
          Pathogen Reference
        </h2>
        <p className="mb-4 text-[12px] font-medium text-slate-500 dark:text-zinc-400 md:mb-6 md:text-[13px]">
          Known 5-7 day, early-to-mature PDA culture characteristics, for manual
          cross-verification alongside the AI result.
        </p>

        {isLoading && (
          <p className="py-6 text-center text-[12px] font-bold text-slate-400">
            Loading reference data...
          </p>
        )}

        {error && (
          <p className="py-6 text-center text-[12px] font-bold text-rose-500">
            {error}
          </p>
        )}

        {!isLoading && !error && (
          // Single divided column on phones; a two-up grid of bordered
          // cards on wide screens, so the list doesn't become one very
          // long scroll down the middle of a desktop window.
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800 lg:grid lg:grid-cols-2 lg:gap-5 lg:divide-y-0">
            {pathogens.map((pathogen) => (
              <div
                key={pathogen.id}
                className="py-4 first:pt-0 last:pb-0 lg:rounded-lg lg:border lg:border-slate-200 lg:bg-slate-50/60 lg:p-5 lg:first:pt-5 lg:last:pb-5 dark:lg:border-zinc-800 dark:lg:bg-zinc-800/40"
              >
                <h3 className="mb-2 text-[13px] font-black italic text-[#006837] dark:text-emerald-500 lg:mb-3 lg:text-[15px]">
                  {pathogen.id}
                </h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] lg:gap-x-5 lg:gap-y-3 lg:text-[13px]">
                  {CHARACTERISTIC_FIELDS.map(({ label, key }) => (
                    <div key={key}>
                      <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        {label}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-200">
                        {pathogen[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-100 py-3 text-sm font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200 md:mx-auto md:mt-8 md:block md:max-w-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
