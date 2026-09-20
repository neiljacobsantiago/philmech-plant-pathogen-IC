import React, { useRef, useState, ChangeEvent, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingDock } from '../components/FloatingDock';
import { CameraCapture } from '../components/CameraCapture';
import { ReferenceSheet } from '../components/ReferenceSheet';
import appLogo from '../assets/appLogo.png';

// Phones have a real native camera app with better controls (flash, zoom,
// HDR) than anything a browser can build - defer to it there, complete
// with the OS's own "allow camera access" prompt. Desktops have no such
// app to hand off to, so the in-browser live camera (CameraCapture) stays
// as the desktop-only path.
const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS reports as Mac

export default function Dashboard() {
  const navigate = useNavigate();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Goes straight to the result - no separate "confirm this photo, then
  // tap Analyze" step. Matches the Results page's own "Scan Another
  // Sample" behavior, and keeps clicks to a minimum (a fresh analysis is
  // one tap away either way, so a confirm step just adds a step back
  // rather than actually protecting anyone from a bad photo).
  const goToAnalysis = (file: File) => {
    navigate('/result', { state: { imageFile: file } });
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) goToAnalysis(file);
    e.target.value = '';
  };

  const handleCameraCapture = (file: File) => {
    setCameraOpen(false);
    goToAnalysis(file);
  };

  const handleCameraClick = () => {
    if (isMobileDevice()) {
      // Hands off to the phone's own camera app - native controls,
      // no custom overlay needed.
      cameraInputRef.current?.click();
    } else {
      // No native camera app to defer to on desktop - use the
      // in-browser live camera instead.
      setCameraOpen(true);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) goToAnalysis(file);
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col text-slate-900 dark:text-zinc-100 bg-[#f4f4f5] dark:bg-zinc-950">

      <div
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)' }}
      >
        {/* Header, padded for the status bar / notch / Dynamic Island */}
        <div
          className="relative w-full overflow-hidden bg-[#006837] px-6 pb-12 shadow-md"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3 md:mx-auto md:max-w-3xl lg:max-w-5xl">
            <img src={appLogo} alt="Logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col text-white">
              <span className="text-[12px] font-extrabold tracking-widest text-white/90 uppercase">PathoScan</span>
              <h1 className="text-xl font-bold tracking-tight leading-tight">{currentDate}</h1>
            </div>
          </div>
        </div>

        {/* px-5 keeps the 20px edge padding at every width; the inner
            max-w grows the usable content at md/lg instead of leaving a
            phone-sized card stranded in the middle of a wide screen. */}
        <main className="w-full flex-1 flex flex-col items-center px-5 py-8 md:mx-auto md:max-w-3xl lg:max-w-5xl">

          <div className="w-full flex flex-col gap-6 md:flex-row md:items-center">

            {/* No frame, no border, no card - just the control itself.
                Click anywhere in this area to scan; drop a file (desktop)
                to analyze it immediately. */}
            <div
              role="button"
              tabIndex={0}
              onClick={handleCameraClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCameraClick(); }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              aria-label="Tap to scan, or drop a photo here"
              className={`flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg py-10 transition-colors md:max-w-sm ${
                isDragging ? 'bg-[#006837]/5 ring-2 ring-[#006837]' : ''
              }`}
            >
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#006837] text-white shadow-xl transition active:scale-95">
                <svg className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <p className="text-center text-[15px] font-bold text-slate-600 dark:text-zinc-300">
                {isDragging ? 'Drop to analyze' : 'Tap to Scan'}
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="text-[12px] font-bold text-[#006837] underline underline-offset-2 dark:text-emerald-500"
              >
                or browse files
              </button>
            </div>

            {/* Stacks below the scan control on phones, sits beside it at
                md and up. */}
            <div className="flex flex-1 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Capture Guidelines</h2>
              <ul className="flex flex-col gap-3 text-[13px] font-medium leading-relaxed text-slate-600 dark:text-zinc-300">
                <li>Use consistent overhead lighting; avoid glare on the plate.</li>
                <li>Keep the camera at a fixed distance, directly above the colony.</li>
                <li>Model supports 5-7 day, early-to-mature PDA cultures.</li>
                <li>On desktop, the built-in webcam (or a connected USB camera) is used to capture the image.</li>
              </ul>
            </div>
          </div>

        </main>
      </div>

      {cameraOpen && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setCameraOpen(false)} />
      )}

      {referenceOpen && <ReferenceSheet onClose={() => setReferenceOpen(false)} />}

      {/* Mobile path: hands off to the phone's native camera app. */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

      <FloatingDock onReferenceClick={() => setReferenceOpen(true)} />
    </div>
  );
}