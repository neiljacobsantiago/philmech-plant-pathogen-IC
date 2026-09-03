import React, { useRef, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingDock } from '../components/FloatingDock';
import appLogo from '../assets/appLogo.png';

export default function Dashboard() {
  const navigate = useNavigate();
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col text-slate-900 dark:text-zinc-100 bg-[#f4f4f5] dark:bg-zinc-950">
      
      <div className="flex-1 flex flex-col pb-32">
        
        {/* Massive, perfectly flat header. Logo PNG background removed. */}
        <div className="w-full bg-[#006837] px-6 pt-24 pb-12 shadow-md">
          <div className="flex items-center gap-3">
            <img src={appLogo} alt="Logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col text-white">
              <span className="text-[12px] font-extrabold tracking-widest text-white/90 uppercase">PICS</span>
              <h1 className="text-xl font-bold tracking-tight leading-tight">{currentDate}</h1>
            </div>
          </div>
        </div>

        {/* Simplest way to force 20px padding universally: px-5 on the parent */}
        <main className="w-full flex-1 flex flex-col items-center justify-center px-5 py-8">
          
          <div className={`relative flex w-full aspect-[3/4] max-h-[550px] flex-col items-center justify-center overflow-hidden rounded-lg bg-white shadow-lg border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 ${previewImg ? 'p-2' : 'p-6'}`}>
            {previewImg ? (
              <>
                <img src={previewImg} alt="Preview" className="h-full w-full object-contain bg-slate-100 dark:bg-black/50 rounded-lg" />
                <button onClick={() => { setPreviewImg(null); setPreviewFile(null); }} className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-md transition active:scale-95 shadow-md">✕</button>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center relative">
                <div className="absolute inset-0">
                  <div className="absolute left-0 top-0 h-10 w-10 border-l-[3px] border-t-[3px] border-[#006837]" />
                  <div className="absolute right-0 top-0 h-10 w-10 border-r-[3px] border-t-[3px] border-[#006837]" />
                  <div className="absolute bottom-0 left-0 h-10 w-10 border-b-[3px] border-l-[3px] border-[#006837]" />
                  <div className="absolute bottom-0 right-0 h-10 w-10 border-b-[3px] border-r-[3px] border-[#006837]" />
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#006837]/10 text-[#006837]">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/></svg>
                </div>
                <p className="mt-6 px-4 text-center text-[15px] font-bold leading-snug text-slate-500 dark:text-zinc-400">Tap below to use camera or upload a photo</p>
              </div>
            )}
          </div>

        </main>
      </div>

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      
      <FloatingDock 
        onCameraClick={() => cameraInputRef.current?.click()} 
        onUploadClick={() => fileInputRef.current?.click()} 
        onAnalyzeClick={() => navigate('/result', { state: { imageFile: previewFile } })}
        isReady={!!previewImg} 
      />
    </div>
  );
}