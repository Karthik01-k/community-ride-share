import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationPickerProps {
  label: string;
  value: string;
  onChange: (location: string, coords: { lat: number; lng: number }) => void;
  placeholder?: string;
}

export const LocationPicker = ({ label, value, onChange, placeholder }: LocationPickerProps) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !inputRef.current) {
        // Load Google Maps script if not already loaded
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => initAutocomplete();
        document.head.appendChild(script);
        return;
      }

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["formatted_address", "geometry", "name"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry?.location) {
          toast({
            title: "Invalid location",
            description: "Please select a valid location from the dropdown",
            variant: "destructive",
          });
          return;
        }

        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        onChange(place.formatted_address || place.name || "", coords);
      });
    };

    initAutocomplete();
  }, [onChange, toast]);

  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Ensure Google Maps is loaded
          if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
            script.async = true;
            await new Promise((resolve) => {
              script.onload = resolve;
              document.head.appendChild(script);
            });
          }

          const geocoder = new google.maps.Geocoder();

          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              onChange(results[0].formatted_address, coords);
              toast({
                title: "Location detected",
                description: "Current location set successfully",
              });
            }
            setIsLoading(false);
          });
        } catch (error) {
          console.error("Error getting address:", error);
          setIsLoading(false);
        }
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Unable to get your location. Please enable location services.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id={label}
            value={value}
            onChange={(e) => onChange(e.target.value, { lat: 0, lng: 0 })}
            placeholder={placeholder || "Enter location"}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={getCurrentLocation}
          disabled={isLoading}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
