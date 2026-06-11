import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Car } from "lucide-react";
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
          body: { origin: startCoords, destination: endCoords },
        });
        if (error) throw error;
        setRouteInfo(data);
        setFuelCost(Math.round(data.distance_km * 8).toString());
        toast({ title: "Route calculated", description: `${data.distance_km.toFixed(1)} km · ${Math.round(data.duration_minutes)} min` });
      } catch (error: any) {
        toast({ title: "Route error", description: error.message, variant: "destructive" });
      } finally { setCalculatingRoute(false); }
    };
    calculateRoute();
  }, [startCoords, endCoords, toast]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (!session) navigate("/auth"); });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureTime || !startCoords || !endCoords || !routeInfo) {
      toast({ title: "Missing information", description: "Fill in all fields and wait for route.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existingVehicle } = await supabase
        .from("vehicles").select("id")
        .eq("owner_id", user.id).eq("type", vehicleType).maybeSingle();

      let vehicleId = existingVehicle?.id;
      if (!vehicleId) {
        const { data: newVehicle, error: vErr } = await supabase
          .from("vehicles")
          .insert({ owner_id: user.id, type: vehicleType, model: `My ${vehicleType}`, number_plate: "TBD", seats_total: parseInt(seatsAvailable) })
          .select("id").single();
        if (vErr) throw vErr;
        vehicleId = newVehicle.id;
      }

      const { error: tErr } = await supabase.from("trips").insert({
        driver_id: user.id, vehicle_id: vehicleId,
        start_location: startLocation, end_location: endLocation,
        start_coords: startCoords, end_coords: endCoords,
        route_polyline: routeInfo.polyline, total_distance_km: routeInfo.distance_km,
        departure_time: departureTime, seats_total: parseInt(seatsAvailable),
        seats_available: parseInt(seatsAvailable), estimated_fuel_cost: parseFloat(fuelCost),
        status: "open",
      });
      if (tErr) throw tErr;
      toast({ title: "Ride posted", description: "Your route is now live." });
      navigate("/find-rides");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const inputCls = "bg-transparent border-x-0 border-t-0 border-b border-border rounded-none h-12 focus-visible:ring-0 focus-visible:border-giallo";

  return (
    <div className="bg-background text-foreground min-h-full">
      <section className="bg-[hsl(0_0%_8%)] px-6 md:px-12 lg:px-20 py-16 border-b border-border">
        <div className="max-w-[1440px] mx-auto">
          <p className="eyebrow text-giallo mb-4">— DRIVER / POST A ROUTE</p>
          <h1 className="font-display text-5xl md:text-7xl text-white leading-[0.95]">
            DRIVE THE ROUTE.<br/>SHARE THE COST.
          </h1>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="lambo-card p-8 md:p-12 space-y-10">
            <div className="space-y-2">
              <Label className="font-display text-[10px] text-muted-foreground">01 / START</Label>
              <LocationPicker
                label=""
                value={startLocation}
                onChange={(location, coords) => { setStartLocation(location); setStartCoords(coords); }}
                placeholder="Pickup point"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-display text-[10px] text-muted-foreground">02 / DESTINATION</Label>
              <LocationPicker
                label=""
                value={endLocation}
                onChange={(location, coords) => { setEndLocation(location); setEndCoords(coords); }}
                placeholder="Drop location"
              />
            </div>

            {calculatingRoute && <p className="font-display text-xs text-giallo">CALCULATING ROUTE…</p>}

            {routeInfo && startCoords && endCoords && (
              <div className="space-y-4">
                <RouteMap origin={startCoords} destination={endCoords} polyline={routeInfo.polyline}
                          className="w-full h-[300px] border border-border" />
                <div className="grid grid-cols-2 border border-border">
                  <div className="p-5 border-r border-border">
                    <p className="font-display text-[10px] text-muted-foreground">DISTANCE</p>
                    <p className="font-display text-2xl text-foreground mt-1">{routeInfo.distance_km.toFixed(1)} KM</p>
                  </div>
                  <div className="p-5">
                    <p className="font-display text-[10px] text-muted-foreground">DURATION</p>
                    <p className="font-display text-2xl text-foreground mt-1">{Math.round(routeInfo.duration_minutes)} MIN</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="datetime" className="font-display text-[10px] text-muted-foreground">03 / DEPARTURE</Label>
              <Input id="datetime" type="datetime-local" value={departureTime}
                     onChange={(e) => setDepartureTime(e.target.value)} required className={inputCls} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="font-display text-[10px] text-muted-foreground">04 / VEHICLE</Label>
                <Select value={vehicleType} onValueChange={(v: any) => setVehicleType(v)}>
                  <SelectTrigger className={inputCls}>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-giallo" />
                      <span className="font-display uppercase">{vehicleType}</span>
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
                <Label htmlFor="seats" className="font-display text-[10px] text-muted-foreground">05 / SEATS</Label>
                <Input id="seats" type="number" min="1" max="7" value={seatsAvailable}
                       onChange={(e) => setSeatsAvailable(e.target.value)} required className={inputCls} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel" className="font-display text-[10px] text-muted-foreground">06 / FUEL ESTIMATE (₹)</Label>
              <Input id="fuel" type="number" min="1" step="0.01"
                     placeholder="Auto from distance" value={fuelCost}
                     onChange={(e) => setFuelCost(e.target.value)} required className={inputCls} />
              <p className="text-xs text-muted-foreground">Base ₹8/km — adjust for your vehicle.</p>
            </div>

            <button type="submit" disabled={loading || calculatingRoute || !routeInfo}
                    className="btn-giallo w-full disabled:opacity-50 h-14">
              {loading ? "POSTING…" : calculatingRoute ? "CALCULATING…" : "POST RIDE"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 border-l-2 border-giallo pl-6">
            <p className="font-display text-xs text-giallo mb-2">— HOW COST SHARING WORKS</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CRSP splits fuel costs by the distance each passenger actually shares with you.
              Half the journey, roughly half the fuel for that portion. Community-focused. Not profit-driven.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostRide;
