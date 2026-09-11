import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getModel } from '../utils/modelLoader';
import { saveSession, loadSession } from '../db/database';
import { PathogenScore } from '../db/schema';

export function useScanData() {
  const location = useLocation();
  const [predictions, setPredictions] = useState<PathogenScore[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;

    async function analyzeImage() {
      setIsAnalyzing(true);
      setError(null);
      try {
        const imageFile = location.state?.imageFile as File | undefined;

        if (imageFile) {
          activeUrl = URL.createObjectURL(imageFile);
          setImageUrl(activeUrl);

          const imgElement = new Image();
          imgElement.src = activeUrl;
          await new Promise((resolve) => { imgElement.onload = resolve; });

          const model = await getModel();
          const rawPredictions = await model.predict(imgElement);

          const formatted = rawPredictions
            .map((p: any) => ({ name: p.className, score: Math.round(p.probability * 100) }))
            .sort((a: PathogenScore, b: PathogenScore) => b.score - a.score);

          if (formatted.length > 0) formatted[0].isTop = true;

          setPredictions(formatted);
          await saveSession(imageFile, formatted);
        } else {
          const saved = await loadSession();
          if (!saved) throw new Error('No image found. Please go back and capture a new photo.');
          activeUrl = URL.createObjectURL(saved.imageFile);
          setImageUrl(activeUrl);
          setPredictions(saved.predictions);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Analysis failed to execute.');
      } finally {
        setIsAnalyzing(false);
      }
    }

    analyzeImage();

    return () => {
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [location.state]);

  return { predictions, imageUrl, isAnalyzing, error };
}