/**
 * Detects touch-first mobile devices (phones/tablets) so callers can route
 * image capture to the OS-native camera app instead of the in-browser live
 * camera feed used on desktop. Shared by Dashboard and AnalysisResult so the
 * capture flow behaves identically no matter where a scan is started.
 */
export const isMobileDevice = (): boolean =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
