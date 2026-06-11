// Minimal ambient declarations to satisfy TS for legacy Google Maps usage.
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace google {
    namespace maps {
      type Map = any;
      type LatLngBounds = any;
      type Marker = any;
      type Polyline = any;
      const Map: any;
      const Marker: any;
      const Polyline: any;
      const LatLngBounds: any;
      namespace geometry {
        const encoding: any;
      }
      namespace places {
        const Autocomplete: any;
      }
    }
  }
}
export {};
