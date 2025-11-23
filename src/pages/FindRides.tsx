import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  start_location: string;
  end_location: string;
  departure_time: string;
  seats_available: number;
  estimated_fuel_cost: number;
  driver: {
    name: string;
    rating: number;
  };
  vehicle: {
    type: string;
  };
}

const FindRides = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchTrips();
    };

    checkAuth();
  }, [navigate]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          driver:profiles!driver_id(name, rating),
          vehicle:vehicles(type)
        `)
        .eq("status", "open")
        .gte("departure_time", new Date().toISOString())
        .order("departure_time", { ascending: true })
        .limit(20);

      if (error) throw error;

      setTrips(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading trips",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // TODO: Implement filtering logic
    toast({
      title: "Search coming soon",
      description: "Route matching will be available in the next update",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Find Your Ride</h1>
            <p className="text-muted-foreground text-lg">
              Search for available rides and split costs with fellow travelers
            </p>
          </div>

          <Card className="p-6 shadow-card border-border/50">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="from"
                    placeholder="Starting location"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="to"
                    placeholder="Destination"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSearch} 
              className="w-full mt-4 rounded-full"
              size="lg"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Rides
            </Button>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-6">Available Rides</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading rides...</p>
              </div>
            ) : trips.length === 0 ? (
              <Card className="p-12 text-center shadow-card">
                <p className="text-muted-foreground text-lg">
                  No rides available at the moment. Check back later or post your own ride!
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    id={trip.id}
                    startLocation={trip.start_location}
                    endLocation={trip.end_location}
                    departureTime={trip.departure_time}
                    seatsAvailable={trip.seats_available}
                    estimatedFuelCost={trip.estimated_fuel_cost}
                    driverName={trip.driver?.name || "Unknown"}
                    driverRating={trip.driver?.rating || 0}
                    vehicleType={trip.vehicle?.type || "car"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindRides;
