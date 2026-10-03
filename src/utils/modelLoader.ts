/** A single class prediction returned by the Teachable Machine image model. */
export interface TeachableMachinePrediction {
  className: string;
  probability: number;
}

/** Minimal surface of the loaded Teachable Machine model that this app relies on. */
export interface TeachableMachineModel {
  predict(
    image: HTMLImageElement | HTMLCanvasElement,
  ): Promise<TeachableMachinePrediction[]>;
}

// tmImage is loaded globally via a <script> tag (see index.html), not as an
// npm module, so there is no package to import types from - this augments
// the global Window type with the minimal shape we actually call into.
declare global {
  interface Window {
    tmImage?: {
      load: (
        modelUrl: string,
        metadataUrl: string,
      ) => Promise<TeachableMachineModel>;
    };
  }
}

/** Side length of the blank warm-up canvas; matches the 224px input size in public/model/metadata.json. */
const WARM_UP_SIZE = 224;

// Cached so the (fairly large) model is fetched and initialized once per
// page load, no matter how many times getModel() is called.
let modelPromise: Promise<TeachableMachineModel> | null = null;

/**
 * Runs one throwaway prediction on a blank canvas. The first predict() call
 * is what compiles TensorFlow.js's GPU shaders, which accounts for most of
 * the "first scan is slow" delay; doing it here moves that cost off the
 * user's first real scan. Best-effort only - a failed warm-up must never
 * block real scans, so errors are swallowed.
 */
async function warmUp(model: TeachableMachineModel): Promise<void> {
  try {
    const blank = document.createElement("canvas");
    blank.width = WARM_UP_SIZE;
    blank.height = WARM_UP_SIZE;
    await model.predict(blank);
  } catch {
    // Intentionally ignored; see the note above.
  }
}

export function getModel(): Promise<TeachableMachineModel> {
  if (!modelPromise) {
    if (!window.tmImage) {
      return Promise.reject(
        new Error("Teachable Machine library failed to load."),
      );
    }
    modelPromise = window.tmImage
      .load("/model/model.json", "/model/metadata.json")
      .then(async (model) => {
        await warmUp(model);
        return model;
      })
      .catch((error) => {
        // Don't cache a failed load: otherwise one bad request (for example
        // a flaky network on first open) would break every later scan until
        // the page is reloaded.
        modelPromise = null;
        throw error;
      });
  }
  return modelPromise;
}