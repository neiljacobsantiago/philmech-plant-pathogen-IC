import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async (mode: 'environment' | 'user') => {
    setError(null);
    setReady(false);
    stopStream();
    try {
      // Phones: this actually gets the rear camera.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setFacing(mode);
      setReady(true);
    } catch (err) {
      // Desktops/laptops have no rear camera to satisfy "environment" -
      // fall back to whatever camera the OS reports (built-in webcam,
      // or an external USB inspection camera if one is plugged in).
      if (mode === 'environment') {
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = fallback;
          if (videoRef.current) {
            videoRef.current.srcObject = fallback;
            await videoRef.current.play();
          }
          setFacing('user');
          setReady(true);
          return;
        } catch {
          setError('Unable to access a camera. Check permissions or use Upload instead.');
          return;
        }
      }
      setError('Unable to access a camera. Check permissions or use Upload instead.');
    }
  }, [stopStream]);

  useEffect(() => {
    startStream('environment');
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          stopStream();
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  const switchCamera = () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    startStream(next);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black">
      {error ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg bg-white p-6 text-center dark:bg-zinc-900">
          <p className="text-sm font-bold text-rose-500">{error}</p>
          <button onClick={handleClose} className="w-full rounded-lg bg-[#006837] py-3 text-sm font-bold text-white">
            Close
          </button>
        </div>
      ) : (
        <>
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />

          {/* Framing guide - reuses the corner-bracket motif from the
              Dashboard's empty scan state for visual consistency. */}
          <div className="pointer-events-none absolute inset-8 sm:inset-16">
            <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-white/80" />
            <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-white/80" />
            <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-white/80" />
            <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-white/80" />
          </div>

          <p
            className="absolute left-0 right-0 text-center text-[11px] font-bold uppercase tracking-widest text-white/80"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
          >
            {facing === 'environment' ? 'Rear Camera' : 'Front / Webcam'}
          </p>

          <div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-8 pt-6"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)' }}
          >
            <button
              onClick={handleClose}
              aria-label="Cancel"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
            >
              ✕
            </button>

            <button
              onClick={handleCapture}
              disabled={!ready}
              aria-label="Capture image"
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/30 backdrop-blur-md transition active:scale-95 disabled:opacity-40"
            >
              <span className="h-12 w-12 rounded-full bg-white" />
            </button>

            <button
              onClick={switchCamera}
              aria-label="Switch camera"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};