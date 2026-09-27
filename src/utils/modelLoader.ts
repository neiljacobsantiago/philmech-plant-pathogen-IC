/** A single class prediction returned by the Teachable Machine image model. */
export interface TeachableMachinePrediction {
  className: string;
  probability: number;
}

/** Minimal surface of the loaded Teachable Machine model that this app relies on. */
export interface TeachableMachineModel {
  predict(image: HTMLImageElement): Promise<TeachableMachinePrediction[]>;
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

// Cached so the (fairly large) model is fetched and initialized once per
// page load, no matter how many times getModel() is called.
let modelPromise: Promise<TeachableMachineModel> | null = null;

export function getModel(): Promise<TeachableMachineModel> {
  if (!modelPromise) {
    if (!window.tmImage) {
      return Promise.reject(
        new Error("Teachable Machine library failed to load."),
      );
    }
    modelPromise = window.tmImage.load(
      "/model/model.json",
      "/model/metadata.json",
    );
  }
  return modelPromise;
}
