// Window-level helpers only — google.maps types come from @googlemaps/js-api-loader.
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}
export {};
