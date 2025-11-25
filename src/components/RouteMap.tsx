import { useEffect, useRef } from "react";

interface RouteMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  polyline?: string;
  className?: string;
}

export const RouteMap = ({ origin, destination, polyline, className }: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) {
        // Load Google Maps script if not already loaded
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
        return;
      }

      // Create map
      const map = new google.maps.Map(mapRef.current, {
        center: origin,
        zoom: 10,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#242f3e" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#242f3e" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#746855" }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Add markers
      new google.maps.Marker({
        position: origin,
        map,
        title: "Start",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
      });

      new google.maps.Marker({
        position: destination,
        map,
        title: "End",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      // Draw route if polyline is provided
      if (polyline) {
        const decodedPath = google.maps.geometry.encoding.decodePath(polyline);

        const routePath = new google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: "#0EA5E9",
          strokeOpacity: 1.0,
          strokeWeight: 4,
        });

        routePath.setMap(map);

        // Fit bounds to show entire route
        const bounds = new google.maps.LatLngBounds();
        decodedPath.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds);
      } else {
        // Fit bounds to show both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(destination);
        map.fitBounds(bounds);
      }
    };

    initMap();
  }, [origin, destination, polyline]);

  return <div ref={mapRef} className={className || "w-full h-[400px] rounded-lg"} />;
};
