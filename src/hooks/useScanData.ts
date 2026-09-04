import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window { tmImage: any; }
}

export type PathogenScore = { name: string; score: number; isTop?: boolean; };

export function useScanData() {
  const location = useLocation();
  const [predictions, setPredictions] = useState<PathogenScore[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;

    async function analyzeImage() {
      try {
        // Grab the file synchronously from React Router state
        const imageFile = location.state?.imageFile;
        if (!imageFile) throw new Error('No image found. Please go back and capture a new photo.');

        activeUrl = URL.createObjectURL(imageFile);
        setImageUrl(activeUrl);

        const imgElement = new Image();
        imgElement.src = activeUrl;
        await new Promise((resolve) => { imgElement.onload = resolve; });

        if (!window.tmImage) throw new Error('Teachable Machine library failed to load.');

        const modelURL = '/model/model.json';
        const metadataURL = '/model/metadata.json';
        const model = await window.tmImage.load(modelURL, metadataURL);

        const rawPredictions = await model.predict(imgElement);

        const formatted = rawPredictions
          .map((p: any) => ({ name: p.className, score: Math.round(p.probability * 100) }))
          .sort((a: PathogenScore, b: PathogenScore) => b.score - a.score);

        if (formatted.length > 0) formatted[0].isTop = true;

        setPredictions(formatted);
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