import React, { useCallback, useEffect, useRef, useState } from "react";
import { isMobileDevice } from "../utils/device";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

/**
 * Maps a getUserMedia() failure to a user-facing message. Browsers report
 * camera failures via DOMException.name rather than a stable error code, so
 * this switches on that name to surface a specific, actionable message
 * instead of a generic "something went wrong."
 */
function describeError(err: unknown): string {
  const name = (err as { name?: string })?.name ?? "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access was blocked. Allow camera permission for this site in your browser settings, then try again.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera was found on this device. Use Upload instead.";
    case "NotReadableError":
    case "AbortError":
      return "The camera is already in use by another app or tab. Close it and try again.";
    default:
      return "Unable to start the camera. Try again, or use Upload instead.";
  }
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(
    async (mode: "environment" | "user") => {
      // Any in-flight start from a previous call is now stale; its results
      // must not overwrite this one's state.
      const requestId = ++requestIdRef.current;
      setError(null);
      setReady(false);
      stopStream();

      // Desktops have no rear camera, so asking for facingMode "environment"
      // there fails, then we immediately ask again - and that second request
      // can come back NotReadableError because the device is still being
      // released from the first. Skip straight to the default camera on
      // desktop instead of attempting a facing-mode match at all.
      const attempts: MediaStreamConstraints[] = isMobileDevice()
        ? [
            { video: { facingMode: { ideal: mode } }, audio: false },
            { video: true, audio: false },
          ]
        : [{ video: true, audio: false }];

      let stream: MediaStream | null = null;
      let lastError: unknown = null;

      for (const constraints of attempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (err) {
          lastError = err;
          // Give the device a moment to be released before the next attempt,
          // otherwise the retry can fail with NotReadableError.
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      if (requestId !== requestIdRef.current) {
        stream?.getTracks().forEach((track) => track.stop());
        return;
      }

      if (!stream) {
        setError(describeError(lastError));
        return;
      }

      streamRef.current = stream;
      setFacing(isMobileDevice() ? mode : "user");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // play() rejects with AbortError whenever playback is interrupted
          // - a re-render, a quick close, the source changing. The stream is
          // still live, so this must NOT be reported as a camera failure.
        }
      }

      if (requestId === requestIdRef.current) setReady(true);
    },
    [stopStream],
  );

  useEffect(() => {
    startStream("environment");
    return () => {
      requestIdRef.current++; // invalidate any in-flight start
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `scan-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          stopStream();
          onCapture(file);
        }
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleClose = () => {
    requestIdRef.current++;
    stopStream();
    onClose();
  };

  const switchCamera = () => {
    startStream(facing === "environment" ? "user" : "environment");
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black">
      {error ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg bg-white p-6 text-center dark:bg-zinc-900">
          <p className="text-sm font-bold text-rose-500">{error}</p>
          <button
            onClick={() => startStream("environment")}
            className="w-full rounded-lg bg-[#006837] py-3 text-sm font-bold text-white"
          >
            Try Again
          </button>
          <button
            onClick={handleClose}
            className="w-full rounded-lg bg-slate-100 py-3 text-sm font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />

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
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 1.5rem)" }}
          >
            {facing === "environment" ? "Rear Camera" : "Front / Webcam"}
          </p>

          <div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-8 pt-6"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)",
            }}
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
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
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
