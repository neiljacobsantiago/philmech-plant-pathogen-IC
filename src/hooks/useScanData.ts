import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getModel } from "../utils/modelLoader";
import { saveSession, loadSession } from "../db/database";
import { PathogenScore } from "../db/schema";

/**
 * Loads an image element for a given source URL, resolving once decoded and
 * ready to hand to the model. Rejects on load failure instead of hanging
 * forever, since a corrupt or unreadable file must surface as an error.
 */
function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the captured image."));
    image.src = src;
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
    let objectUrl: string | null = null;

    async function analyzeImage() {
      setIsAnalyzing(true);
      setError(null);

      try {
        const imageFile = location.state?.imageFile as File | undefined;

        if (imageFile) {
          objectUrl = URL.createObjectURL(imageFile);
          setImageUrl(objectUrl);

          const imageElement = await loadImageElement(objectUrl);

          const model = await getModel();
          const rawPredictions = await model.predict(imageElement);

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
          if (!savedSession) {
            throw new Error(
              "No image found. Please go back and capture a new photo.",
            );
          }
          objectUrl = URL.createObjectURL(savedSession.imageFile);
          setImageUrl(objectUrl);
          setPredictions(savedSession.predictions);
        }
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Analysis failed to execute.",
        );
      } finally {
        setIsAnalyzing(false);
      }
    }

    analyzeImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [location.state]);

  return { predictions, imageUrl, isAnalyzing, error };
}
