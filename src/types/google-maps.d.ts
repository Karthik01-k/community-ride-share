// Minimal ambient declarations to satisfy TS for legacy Google Maps usage.
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
  const google: any;
}
export {};
