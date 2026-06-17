import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TripCard from "@/components/TripCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Search, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  start_location: string;
  end_location: string;
  departure_time: string;
  seats_available: number;
  estimated_fuel_cost: number;
  driver: { name: string; rating: number };
  vehicle: { type: string };
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
      if (!session) { navigate("/auth"); return; }
      fetchTrips();
    };
    checkAuth();
  }, [navigate]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .select(`*, driver:profiles!driver_id(name, rating), vehicle:vehicles(type)`)
        .eq("status", "open")
        .gte("departure_time", new Date().toISOString())
        .order("departure_time", { ascending: true })
        .limit(20);
      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast({ title: "Error loading trips", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSearch = () => {
    toast({ title: "Search coming soon", description: "Route matching ships next." });
  };

  return (
    <div className="bg-background text-foreground min-h-full">
      {/* Hero strip */}
      <section className="bg-[hsl(0_0%_8%)] px-6 md:px-12 lg:px-20 py-16 border-b border-border">
        <div className="max-w-[1440px] mx-auto">
          <p className="eyebrow text-giallo mb-4">— BROWSE / OPEN ROUTES</p>
          <h1 className="font-display text-5xl md:text-7xl text-white leading-[0.95]">
            FIND YOUR<br/>NEXT RIDE.
          </h1>
        </div>
      </section>

      {/* Search bar — flat industrial */}
      <section className="px-6 md:px-12 lg:px-20 py-10 border-b border-border bg-[hsl(0_0%_10%)]">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
          <div>
            <Label htmlFor="from" className="font-display text-[10px] text-muted-foreground">FROM</Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-giallo" />
              <Input id="from" value={fromLocation} onChange={(e) => setFromLocation(e.target.value)}
                     placeholder="Starting location"
                     className="pl-10 bg-transparent border-x-0 border-t-0 border-b border-border rounded-none h-12 focus-visible:ring-0 focus-visible:border-giallo" />
            </div>
          </div>
          <div>
            <Label htmlFor="to" className="font-display text-[10px] text-muted-foreground">TO</Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
              <Input id="to" value={toLocation} onChange={(e) => setToLocation(e.target.value)}
                     placeholder="Destination"
                     className="pl-10 bg-transparent border-x-0 border-t-0 border-b border-border rounded-none h-12 focus-visible:ring-0 focus-visible:border-giallo" />
            </div>
          </div>
          <div>
            <Label htmlFor="date" className="font-display text-[10px] text-muted-foreground">DATE</Label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
                     className="pl-10 bg-transparent text-foreground border-x-0 border-t-0 border-b border-border rounded-none h-12 focus-visible:ring-0 focus-visible:border-giallo [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
            </div>
          </div>
          <button onClick={handleSearch} className="btn-giallo h-12">
            <Search className="h-4 w-4" /> SEARCH
          </button>
        </div>
      </section>

      {/* Results */}
      <section className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              AVAILABLE ROUTES <span className="text-giallo">— {trips.length}</span>
            </h2>
            <span className="btn-ghost-arrow">
              SORT: SOONEST FIRST <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          {loading ? (
            <p className="font-display text-sm text-muted-foreground">LOADING ROUTES…</p>
          ) : trips.length === 0 ? (
            <div className="lambo-card p-16 text-center">
              <p className="font-display text-xl text-foreground mb-2">NO ROUTES OPEN.</p>
              <p className="text-sm text-muted-foreground">Check back soon or post your own.</p>
            </div>
          ) : (
            <div className="grid gap-4">
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
      </section>
    </div>
  );
};

export default FindRides;
