import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getModel } from "../utils/modelLoader";
import { saveSession, loadSession } from "../db/database";
import { PathogenScore } from "../db/schema";

/**
 * Loads an image element for a given object URL, resolving once decoded and
 * ready to hand to the model. Rejects on load failure instead of hanging
 * forever, since a corrupt or unreadable file must surface as an error.
 */
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unable to load the captured image."));
    image.src = url;
  });
}

/**
 * Runs the pathogen classification model against a newly captured photo, or
 * restores the most recent scan when the page is reloaded/reopened with no
 * fresh image (e.g. state was lost on navigation). Owns the full lifecycle:
 * object-URL creation/cleanup, model inference, and persisting the result so
 * it survives a refresh.
 */
export function useScanData() {
  const location = useLocation();
  const [predictions, setPredictions] = useState<PathogenScore[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // React StrictMode runs effects twice in development: mount, cleanup,
    // mount again. The cleanup revokes the object URL while the first run
    // is still awaiting the image load, so that load fails - and without
    // this flag its failure was written to state, showing "Unable to load
    // the captured image" even though the second run succeeded. Anything
    // after an await must check this before touching state.
    let cancelled = false;
    let activeUrl: string | null = null;

    async function analyzeImage() {
      setIsAnalyzing(true);
      setError(null);

      try {
        const imageFile = location.state?.imageFile as File | undefined;

        if (imageFile) {
          // Catches empty or corrupted files before they reach the model,
          // with a message that says what actually went wrong.
          if (imageFile.size === 0) {
            throw new Error(
              "That file is empty or corrupted. Please choose a different image.",
            );
          }

          activeUrl = URL.createObjectURL(imageFile);
          if (cancelled) return;
          setImageUrl(activeUrl);

          const imageElement = await loadImageElement(activeUrl);
          if (cancelled) return;

          const model = await getModel();
          if (cancelled) return;

          const rawPredictions = await model.predict(imageElement);
          if (cancelled) return;

          const rankedPredictions = rawPredictions
            .map((prediction) => ({
              name: prediction.className,
              score: Math.round(prediction.probability * 100),
            }))
            .sort((a: PathogenScore, b: PathogenScore) => b.score - a.score);

          setPredictions(rankedPredictions);
          await saveSession(imageFile, rankedPredictions);
        } else {
          const savedSession = await loadSession();
          if (cancelled) return;
          if (!savedSession) {
            throw new Error(
              "No image found. Please go back and capture a new photo.",
            );
          }
          activeUrl = URL.createObjectURL(savedSession.imageFile);
          setImageUrl(activeUrl);
          setPredictions(savedSession.predictions);
        }
      } catch (err) {
        if (cancelled) return; // A superseded run must not report failure.
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Analysis failed to execute.",
        );
      } finally {
        if (!cancelled) setIsAnalyzing(false);
      }
    }

    analyzeImage();

    return () => {
      cancelled = true;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [location.state]);

  return { predictions, imageUrl, isAnalyzing, error };
}
