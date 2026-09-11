declare global {
  interface Window { tmImage: any; }
}

let modelPromise: Promise<any> | null = null;

export function getModel(): Promise<any> {
  if (!modelPromise) {
    if (!window.tmImage) {
      return Promise.reject(new Error('Teachable Machine library failed to load.'));
    }
    modelPromise = window.tmImage.load('/model/model.json', '/model/metadata.json');
  }
  return modelPromise;
}