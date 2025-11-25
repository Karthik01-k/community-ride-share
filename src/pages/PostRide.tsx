import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/LocationPicker";
import { RouteMap } from "@/components/RouteMap";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PostRide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [endCoords, setEndCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [departureTime, setDepartureTime] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "bike" | "auto">("car");
  const [seatsAvailable, setSeatsAvailable] = useState("3");
  const [fuelCost, setFuelCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  useEffect(() => {
    const calculateRoute = async () => {
      if (!startCoords || !endCoords) return;
      
      setCalculatingRoute(true);
      try {
        const { data, error } = await supabase.functions.invoke("calculate-route", {
          body: {
            origin: startCoords,
            destination: endCoords,
          },
        });

        if (error) throw error;

        setRouteInfo(data);
        
        // Auto-calculate fuel cost (₹8 per km as base estimate)
        const estimatedCost = Math.round(data.distance_km * 8);
        setFuelCost(estimatedCost.toString());

        toast({
          title: "Route calculated",
          description: `Distance: ${data.distance_km.toFixed(1)} km, Duration: ${Math.round(data.duration_minutes)} min`,
        });
      } catch (error: any) {
        toast({
          title: "Error calculating route",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setCalculatingRoute(false);
      }
    };

    calculateRoute();
  }, [startCoords, endCoords, toast]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!departureTime || !startCoords || !endCoords || !routeInfo) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and wait for route calculation",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a basic vehicle entry if none exists
      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("id")
        .eq("owner_id", user.id)
        .eq("type", vehicleType)
        .maybeSingle();

      let vehicleId = existingVehicle?.id;

      if (!vehicleId) {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            owner_id: user.id,
            type: vehicleType,
            model: `My ${vehicleType}`,
            number_plate: "TBD",
            seats_total: parseInt(seatsAvailable),
          })
          .select("id")
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = newVehicle.id;
      }

      const { error: tripError } = await supabase.from("trips").insert({
        driver_id: user.id,
        vehicle_id: vehicleId,
        start_location: startLocation,
        end_location: endLocation,
        start_coords: startCoords,
        end_coords: endCoords,
        route_polyline: routeInfo.polyline,
        total_distance_km: routeInfo.distance_km,
        departure_time: departureTime,
        seats_total: parseInt(seatsAvailable),
        seats_available: parseInt(seatsAvailable),
        estimated_fuel_cost: parseFloat(fuelCost),
        status: "open",
      });

      if (tripError) throw tripError;

      toast({
        title: "Ride posted successfully!",
        description: "Your ride is now visible to other travelers",
      });

      navigate("/find-rides");
    } catch (error: any) {
      toast({
        title: "Error posting ride",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Post Your Ride</h1>
            <p className="text-muted-foreground text-lg">
              Share your journey and split fuel costs with fellow travelers
            </p>
          </div>

          <Card className="p-8 shadow-elevated border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <LocationPicker
                label="Starting Location"
                value={startLocation}
                onChange={(location, coords) => {
                  setStartLocation(location);
                  setStartCoords(coords);
                }}
                placeholder="Enter pickup location"
              />

              <LocationPicker
                label="Destination"
                value={endLocation}
                onChange={(location, coords) => {
                  setEndLocation(location);
                  setEndCoords(coords);
                }}
                placeholder="Enter destination"
              />

              {calculatingRoute && (
                <div className="text-sm text-muted-foreground">
                  Calculating route...
                </div>
              )}

              {routeInfo && startCoords && endCoords && (
                <div className="space-y-4">
                  <RouteMap
                    origin={startCoords}
                    destination={endCoords}
                    polyline={routeInfo.polyline}
                    className="w-full h-[300px] rounded-lg border border-border"
                  />
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Distance</p>
                      <p className="text-lg font-semibold">{routeInfo.distance_km.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-semibold">{Math.round(routeInfo.duration_minutes)} min</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="datetime">Departure Date & Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={(value: any) => setVehicleType(value)}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>{vehicleType}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Available Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="7"
                    value={seatsAvailable}
                    onChange={(e) => setSeatsAvailable(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel">Estimated Total Fuel Cost (₹)</Label>
                <Input
                  id="fuel"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Auto-calculated based on distance"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Based on ₹8/km. You can adjust this based on your vehicle's fuel efficiency.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-full" 
                size="lg" 
                disabled={loading || calculatingRoute || !routeInfo}
                variant="secondary"
              >
                {loading ? "Posting..." : calculatingRoute ? "Calculating route..." : "Post Ride"}
              </Button>
            </form>
          </Card>

          <Card className="p-6 bg-muted/30 border-secondary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-secondary">💡</span> How Cost Sharing Works
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CRSP splits fuel costs fairly based on the distance each passenger shares with you. 
              If someone joins for half your journey, they'll pay roughly half your fuel cost for that portion. 
              This keeps it community-focused, not profit-driven.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostRide;
