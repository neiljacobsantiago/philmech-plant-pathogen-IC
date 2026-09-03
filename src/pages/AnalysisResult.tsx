import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScanData } from '../hooks/useScanData';
import { getPathogenById } from '../db/database';
import { PathogenRecord } from '../db/schema';
import { FloatingDock } from '../components/FloatingDock';

const getMatrixColor = (score: number) => {
  if (score >= 90) return { bg: 'bg-[#006837]', text: 'text-[#006837] dark:text-emerald-500' };
  if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-500' };
  if (score >= 70) return { bg: 'bg-[#ffca28]', text: 'text-[#ffca28]' };
  if (score >= 50) return { bg: 'bg-orange-500', text: 'text-orange-500' };
  return { bg: 'bg-rose-500', text: 'text-rose-500' };
};

export default function AnalysisResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { predictions, imageUrl, isAnalyzing, error } = useScanData();
  const [characteristics, setCharacteristics] = useState<PathogenRecord | null>(null);
  const topMatch = predictions[0] || { name: 'Unknown', score: 0 };

  useEffect(() => {
    if (topMatch.name !== 'Unknown') {
      getPathogenById(topMatch.name).then((data) => { if (data) setCharacteristics(data); });
    }
  }, [topMatch.name]);

  if (isAnalyzing || error) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center p-6 text-center bg-[#f4f4f5] dark:bg-zinc-950">
        {error ? (
          <>
            <p className="text-lg font-bold text-rose-500">{error}</p>
            <button onClick={() => navigate('/')} className="mt-6 rounded-lg bg-[#006837] px-8 py-3 text-sm font-bold text-white shadow-sm">Go Back</button>
          </>
        ) : (
          <div className="animate-pulse text-sm font-black tracking-widest text-[#006837] uppercase">Analyzing Specimen...</div>
        )}
      </div>
    );
  }

  const displayChars = characteristics || { growthRate: "N/A", surfaceColor: "N/A", reverseColor: "N/A", myceliumTexture: "N/A" };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col text-slate-900 dark:text-zinc-100 bg-[#f4f4f5] dark:bg-zinc-950">
      
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
      >
        <header
          className="sticky top-0 z-40 flex items-center bg-[#f4f4f5]/95 px-5 pb-4 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 dark:bg-zinc-950/95"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          <button onClick={() => navigate('/')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 shadow-sm transition active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <svg className="h-5 w-5 pr-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span className="ml-4 text-lg font-black text-slate-900 dark:text-white">Analysis Result</span>
        </header>

        {/* Simplest way to force 20px padding universally: px-5 on the parent */}
        <main className="w-full flex flex-col gap-5 px-5 pt-6 pb-6">
          
          <div className="w-full relative h-64 overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900">
            <img src={imageUrl || ''} alt="Specimen" className="h-full w-full object-cover" />
            <div className="absolute right-3 top-3 rounded-lg bg-[#006837] px-3 py-1.5 text-[10px] font-black tracking-widest text-white shadow-sm uppercase">✓ Analyzed</div>
          </div>

          <div className="w-full flex items-center justify-between rounded-lg bg-white p-5 shadow-sm border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-1 flex-col pr-4 break-words">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Top Match</span>
              <h1 className="mt-1 text-[26px] font-black italic leading-tight text-slate-900 dark:text-white">{topMatch.name}</h1>
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-[#006837] px-4 py-3 text-white shadow-md">
              <span className="text-2xl font-black">{topMatch.score}%</span>
              <span className="mt-1 text-[7px] font-bold uppercase tracking-widest opacity-90">Confidence</span>
            </div>
          </div>

          <div className="w-full rounded-lg bg-white p-5 shadow-sm border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Pathogen Probability Matrix</span>
            
            <div className="mt-5 flex flex-col gap-4">
              {predictions.map((item, index) => {
                const colors = getMatrixColor(item.score);
                return (
                  <div key={item.name} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-3">
                      <span className={`flex-1 break-words text-[15px] leading-snug ${index === 0 ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-600 dark:text-zinc-400'}`}>
                        {item.name}
                      </span>
                      <span className={`${colors.text} shrink-0 text-[14px] font-bold`}>{item.score}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-800">
                      <div className={`h-full rounded-lg ${colors.bg}`} style={{ width: `${Math.max(item.score, 1)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-4 dark:border-zinc-800">
              {[
                { color: 'bg-[#006837]', label: '≥ 90%' },
                { color: 'bg-emerald-500', label: '80-89%' },
                { color: 'bg-[#ffca28]', label: '70-79%' },
                { color: 'bg-orange-500', label: '50-69%' },
                { color: 'bg-rose-500', label: '< 50%' },
              ].map((legend) => (
                <span key={legend.label} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                  <span className={`h-2 w-2 rounded-full ${legend.color}`} />
                  {legend.label}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full">
            <span className="mb-3 block px-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Cultural Characteristics</span>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '⚡', label: 'Growth Rate', val: displayChars.growthRate },
                { icon: '🟡', label: 'Surface Color', val: displayChars.surfaceColor },
                { icon: '🔆', label: 'Reverse Color', val: displayChars.reverseColor },
                { icon: '🔬', label: 'Texture', val: displayChars.myceliumTexture }
              ].map(char => (
                <div key={char.label} className="flex flex-col rounded-lg bg-white p-5 shadow-sm border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-2xl">{char.icon}</span>
                  <span className="mt-4 block text-[9px] font-bold tracking-widest text-slate-400 uppercase">{char.label}</span>
                  <p className="mt-1.5 break-words text-[13px] font-black leading-tight text-slate-800 dark:text-zinc-200">{char.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col rounded-lg bg-slate-200/50 p-5 dark:bg-zinc-900/50 border border-transparent dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-slate-500 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span className="text-[10px] font-bold tracking-widest text-slate-700 uppercase dark:text-zinc-300">Limitation</span>
            </div>
            <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-500 dark:text-zinc-400">
              Accuracy is affected by lighting and image quality. Model restricted to 5 early-stage pathogens. This tool accelerates preliminary classification and does not replace standard laboratory process.
            </p>
          </div>
        </main>
      </div>

      <FloatingDock onCameraClick={() => navigate('/')} onUploadClick={() => navigate('/')} />
    </div>
  );
}