import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Car, IndianRupee, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const tripSchema = z.object({
  startLocation: z.string().min(3, "Start location must be at least 3 characters"),
  endLocation: z.string().min(3, "End location must be at least 3 characters"),
  departureTime: z.string().min(1, "Please select a departure time"),
  seats: z.number().min(1, "At least 1 seat required").max(7, "Maximum 7 seats"),
  fuelCost: z.number().min(1, "Fuel cost must be greater than 0"),
  vehicleType: z.enum(["car", "bike", "auto"]),
});

const PostRide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState("3");
  const [fuelCost, setFuelCost] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "bike" | "auto">("car");

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
    
    try {
      const validatedData = tripSchema.parse({
        startLocation,
        endLocation,
        departureTime,
        seats: parseInt(seats),
        fuelCost: parseFloat(fuelCost),
        vehicleType,
      });

      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a basic vehicle entry if none exists
      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("id")
        .eq("owner_id", user.id)
        .eq("type", vehicleType)
        .single();

      let vehicleId = existingVehicle?.id;

      if (!vehicleId) {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            owner_id: user.id,
            type: vehicleType,
            model: `My ${vehicleType}`,
            number_plate: "TBD",
            seats_total: parseInt(seats),
          })
          .select("id")
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = newVehicle.id;
      }

      // For now, use placeholder coordinates - will be replaced with Google Maps API
      const { error: tripError } = await supabase.from("trips").insert({
        driver_id: user.id,
        vehicle_id: vehicleId,
        start_location: validatedData.startLocation,
        end_location: validatedData.endLocation,
        start_coords: { lat: 0, lng: 0 },
        end_coords: { lat: 0, lng: 0 },
        departure_time: validatedData.departureTime,
        seats_total: validatedData.seats,
        seats_available: validatedData.seats,
        estimated_fuel_cost: validatedData.fuelCost,
        status: "open",
      });

      if (tripError) throw tripError;

      toast({
        title: "Ride posted successfully!",
        description: "Your ride is now visible to other travelers",
      });

      navigate("/find-rides");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error posting ride",
          description: error.message,
          variant: "destructive",
        });
      }
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
              <div className="space-y-2">
                <Label htmlFor="start">Starting Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start"
                    placeholder="e.g., Kurabalakota"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end"
                    placeholder="e.g., Tirupati"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="datetime">Departure Date & Time</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={(value: any) => setVehicleType(value)}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <SelectValue />
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
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="seats"
                      type="number"
                      min="1"
                      max="7"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel">Estimated Total Fuel Cost (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fuel"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g., 500"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Passengers will contribute based on shared distance
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-full" 
                size="lg" 
                disabled={loading}
                variant="secondary"
              >
                {loading ? "Posting..." : "Post Ride"}
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
