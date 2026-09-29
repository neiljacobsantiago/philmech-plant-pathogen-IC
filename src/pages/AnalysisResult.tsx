import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useScanData } from "../hooks/useScanData";
import { getPathogenById } from "../db/database";
import { PathogenRecord } from "../db/schema";
import { isMobileDevice } from "../utils/device";
import { FloatingDock } from "../components/FloatingDock";
import { ReferenceSheet } from "../components/ReferenceSheet";
import { CameraCapture } from "../components/CameraCapture";

/** Cultural-characteristic values shown when no seeded record matches the top prediction. */
const FALLBACK_CHARACTERISTICS: Omit<PathogenRecord, "id"> = {
  growthRate: "N/A",
  surfaceColor: "N/A",
  reverseColor: "N/A",
  myceliumTexture: "N/A",
};

/** Cards rendered under "Cultural Characteristics", in display order. */
const CULTURAL_CHARACTERISTIC_FIELDS: {
  label: string;
  key: keyof Omit<PathogenRecord, "id">;
}[] = [
  { label: "Growth Rate", key: "growthRate" },
  { label: "Surface Color", key: "surfaceColor" },
  { label: "Reverse Color", key: "reverseColor" },
  { label: "Texture", key: "myceliumTexture" },
];

/** Confidence-band color key for the probability matrix bars and legend. */
const MATRIX_LEGEND: { color: string; label: string }[] = [
  { color: "bg-[#006837]", label: "≥ 90%" },
  { color: "bg-emerald-500", label: "80-89%" },
  { color: "bg-[#ffca28]", label: "70-79%" },
  { color: "bg-orange-500", label: "50-69%" },
  { color: "bg-rose-500", label: "< 50%" },
];

/** Maps a match score to its confidence-band colors (bar fill + label text). */
const getMatrixColor = (score: number) => {
  if (score >= 90)
    return { bg: "bg-[#006837]", text: "text-[#006837] dark:text-emerald-500" };
  if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-500" };
  if (score >= 70) return { bg: "bg-[#ffca28]", text: "text-[#ffca28]" };
  if (score >= 50) return { bg: "bg-orange-500", text: "text-orange-500" };
  return { bg: "bg-rose-500", text: "text-rose-500" };
};

/**
 * Plain-language clearance messaging for the top match. Deliberately avoids
 * naming "PCR" specifically, since the SRS allows PCR OR DNA sequencing as
 * follow-up confirmation, and names the common causes of a low-confidence or
 * no-match result so the message is actually actionable, not just a
 * compliance disclaimer.
 */
const getClearanceStatus = (name: string, score: number) => {
  if (name === "Unknown") {
    return {
      label: "Out of Scope / No Confident Match",
      message:
        "No confident match among the 5 target pathogens. This can happen from poor lighting, an unclear photo, or another growth in the sample. It may simply be outside what this tool can identify.",
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-zinc-300",
      tint: "bg-slate-100 dark:bg-zinc-800/60",
    };
  }
  if (score >= 90) {
    return {
      label: "Clearance Threshold Met",
      message:
        "Meets the confidence needed for automatic clearance. This result may be used for preliminary screening.",
      dot: "bg-[#006837]",
      text: "text-[#006837] dark:text-emerald-500",
      tint: "bg-[#006837]/10 dark:bg-emerald-500/10",
    };
  }
  return {
    label: "Further Testing Required",
    message:
      "Below the confidence needed for automatic clearance. This can happen due to lighting, image quality, or another growth in the sample. Confirm this result with further lab testing before relying on it.",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    tint: "bg-rose-50 dark:bg-rose-500/10",
  };
};

export default function AnalysisResult() {
  const navigate = useNavigate();
  const { predictions, imageUrl, isAnalyzing, error } = useScanData();
  const [characteristics, setCharacteristics] = useState<PathogenRecord | null>(
    null,
  );
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleRescan = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file)
      navigate("/result", { state: { imageFile: file }, replace: true });
    event.target.value = "";
  };

  const handleCameraCapture = (file: File) => {
    setCameraOpen(false);
    navigate("/result", { state: { imageFile: file }, replace: true });
  };

  const handleRetryScan = () => {
    if (isMobileDevice()) {
      cameraInputRef.current?.click();
    } else {
      setCameraOpen(true);
    }
  };

  const topMatch = predictions[0] || { name: "Unknown", score: 0 };

  // Look up the seeded reference record for the top match so the
  // "Cultural Characteristics" cards can cross-check the model's call
  // against the lab-sourced growth data for that species.
  useEffect(() => {
    if (topMatch.name === "Unknown") return;

    getPathogenById(topMatch.name).then((record) => {
      if (record) setCharacteristics(record);
    });
  }, [topMatch.name]);

  if (isAnalyzing || error) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center p-6 text-center bg-[#f4f4f5] dark:bg-zinc-950">
        {error ? (
          <>
            <p className="text-lg font-bold text-rose-500">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 rounded-lg bg-[#006837] px-8 py-3 text-sm font-bold text-white shadow-sm"
            >
              Go Back
            </button>
          </>
        ) : (
          <div className="animate-pulse text-sm font-black tracking-widest text-[#006837] uppercase">
            Analyzing Pathogen...
          </div>
        )}
      </div>
    );
  }

  const displayChars = characteristics || FALLBACK_CHARACTERISTICS;
  const clearance = getClearanceStatus(topMatch.name, topMatch.score);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col text-slate-900 dark:text-zinc-100 bg-[#f4f4f5] dark:bg-zinc-950">
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6rem)",
        }}
      >
        {/* Header spans the full canvas; its inner row is width-capped to
            line up with the content column below it. */}
        <header
          className="sticky top-0 z-40 bg-[#f4f4f5]/95 px-5 pb-4 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 dark:bg-zinc-950/95"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        >
          <div className="flex items-center md:mx-auto md:max-w-3xl lg:max-w-4xl">
            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 shadow-sm transition active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <svg
                className="h-5 w-5 pr-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="ml-4 text-lg font-black text-slate-900 dark:text-white">
              Analysis Result
            </span>
          </div>
        </header>

        {/* px-5 keeps the 20px edge padding at every width. The max-w cap
            stops the image, cards, and probability bars from stretching
            the full width of a desktop monitor - the element order is
            unchanged, so it reads top-to-bottom the same on every size. */}
        <main className="w-full flex flex-col gap-5 px-5 pt-6 pb-6 md:mx-auto md:max-w-3xl lg:max-w-4xl lg:gap-6 lg:pt-8">
          <div className="w-full relative h-64 overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 lg:h-80">
            <img
              src={imageUrl || ""}
              alt="Specimen"
              className="h-full w-full object-cover"
            />
            <div className="absolute right-3 top-3 rounded-lg bg-[#006837] px-3 py-1.5 text-[10px] font-black tracking-widest text-white shadow-sm uppercase">
              ✓ Analyzed
            </div>
          </div>

          <div className="w-full flex items-center justify-between rounded-lg bg-white p-5 shadow-sm border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 lg:p-6">
            <div className="flex flex-1 flex-col pr-4 break-words">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Top Match
              </span>
              <h1 className="mt-1 text-[26px] font-black italic leading-tight text-slate-900 dark:text-white lg:text-[30px]">
                {topMatch.name}
              </h1>
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-[#006837] px-4 py-3 text-white shadow-md">
              <span className="text-2xl font-black">{topMatch.score}%</span>
              <span className="mt-1 text-[7px] font-bold uppercase tracking-widest opacity-90">
                Confidence
              </span>
            </div>
          </div>

          {/* Clearance status - plain-language explanation of what the
              score actually means. */}
          <div
            className={`w-full flex items-start gap-3 rounded-lg p-4 border border-transparent lg:p-5 ${clearance.tint}`}
          >
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${clearance.dot}`}
            />
            <div className="flex flex-col">
              <span
                className={`text-[11px] font-black uppercase tracking-widest ${clearance.text}`}
              >
                {clearance.label}
              </span>
              <p className="mt-0.5 text-[12px] font-medium leading-snug text-slate-600 dark:text-zinc-300 lg:text-[13px]">
                {clearance.message}
              </p>
            </div>
          </div>

          {/* Always available, regardless of outcome. The button is capped
              on desktop so it doesn't become a monitor-wide slab. */}
          <div className="w-full flex items-center gap-4">
            <button
              type="button"
              onClick={handleRetryScan}
              className="flex-1 rounded-lg bg-[#006837] py-3 text-center text-[13px] font-bold text-white shadow-sm transition active:scale-95 lg:max-w-xs lg:flex-none lg:px-10"
            >
              Scan Another Sample
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="shrink-0 text-[12px] font-bold text-[#006837] underline underline-offset-2 dark:text-emerald-500"
            >
              or choose a photo
            </button>
          </div>

          <div className="w-full rounded-lg bg-white p-5 shadow-sm border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 lg:p-6">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Pathogen Probability Matrix
            </span>

            <div className="mt-5 flex flex-col gap-4">
              {predictions.map((prediction, index) => {
                const colors = getMatrixColor(prediction.score);
                const isTopMatch = index === 0;
                return (
                  <div key={prediction.name} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-3">
                      <span
                        className={`flex-1 break-words text-[15px] leading-snug ${isTopMatch ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-600 dark:text-zinc-400"}`}
                      >
                        {prediction.name}
                      </span>
                      <span
                        className={`${colors.text} shrink-0 text-[14px] font-bold`}
                      >
                        {prediction.score}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-lg ${colors.bg}`}
                        style={{ width: `${Math.max(prediction.score, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-4 dark:border-zinc-800">
              {MATRIX_LEGEND.map((entry) => (
                <span
                  key={entry.label}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400"
                >
                  <span className={`h-2 w-2 rounded-full ${entry.color}`} />
                  {entry.label}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full">
            <span className="mb-3 block px-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Cultural Characteristics
            </span>
            {/* Two cards per row on phones, four across on desktop so the
                set reads as one band instead of a tall 2x2 block. */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {CULTURAL_CHARACTERISTIC_FIELDS.map(({ label, key }) => (
                <div
                  key={key}
                  className="flex flex-col rounded-lg bg-white p-5 shadow-sm border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Reserved icon slot - no per-pathogen icon set yet; kept as a spacer so card spacing matches its siblings. */}
                  <span className="text-2xl" aria-hidden="true" />
                  <span className="mt-4 block text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                    {label}
                  </span>
                  <p className="mt-1.5 break-words text-[13px] font-black leading-tight text-slate-800 dark:text-zinc-200">
                    {displayChars[key]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col rounded-lg bg-slate-200/50 p-5 dark:bg-zinc-900/50 border border-transparent dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0 text-slate-500 dark:text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-[10px] font-bold tracking-widest text-slate-700 uppercase dark:text-zinc-300">
                Limitation
              </span>
            </div>
            <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-500 dark:text-zinc-400">
              Accuracy is affected by lighting and image quality. Model
              restricted to 5-7 early-to-mature stage pathogens. This tool
              accelerates preliminary classification and does not replace
              standard laboratory process.
            </p>
          </div>
        </main>
      </div>

      {cameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleRescan}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleRescan}
      />

      {referenceOpen && (
        <ReferenceSheet onClose={() => setReferenceOpen(false)} />
      )}

      <FloatingDock onReferenceClick={() => setReferenceOpen(true)} />
    </div>
  );
}
