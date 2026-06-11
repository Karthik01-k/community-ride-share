import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Calendar, Car, IndianRupee, MapPin, Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RouteMap } from "@/components/RouteMap";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";

interface TripDetail {
  id: string;
  start_location: string; end_location: string;
  start_coords: { lat: number; lng: number };
  end_coords: { lat: number; lng: number };
  route_polyline: string | null;
  total_distance_km: number | null;
  departure_time: string;
  seats_available: number; seats_total: number;
  estimated_fuel_cost: number;
  driver: { id: string; name: string; rating: number };
  vehicle: { type: string; model: string };
}

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [seatsRequested, setSeatsRequested] = useState("1");
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [userId, setUserId] = useState<string | undefined>();

  useRealtimeBookings({
    userId,
    onBookingUpdate: async () => {
      if (userId && id) {
        const { data } = await supabase.from("bookings").select("*")
          .eq("trip_id", id).eq("passenger_id", userId).maybeSingle();
        setExistingBooking(data);
      }
    },
  });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
      try {
        const { data, error } = await supabase.from("trips")
          .select(`*, driver:profiles!driver_id(id, name, rating), vehicle:vehicles(type, model)`)
          .eq("id", id).single();
        if (error) throw error;
        setTrip({ ...data, start_coords: data.start_coords as any, end_coords: data.end_coords as any });
        const { data: bk } = await supabase.from("bookings").select("*")
          .eq("trip_id", id).eq("passenger_id", session.user.id)
          .in("status", ["pending", "confirmed"]).maybeSingle();
        setExistingBooking(bk);
      } catch (error: any) {
        toast({ title: "Error loading trip", description: error.message, variant: "destructive" });
        navigate("/find-rides");
      } finally { setLoading(false); }
    };
    load();
  }, [id, navigate, toast]);

  const handleBooking = async () => {
    if (!trip) return;
    try {
      setBookingLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (user.id === trip.driver.id) {
        toast({ title: "Cannot book own trip", variant: "destructive" }); return;
      }
      if (existingBooking) {
        toast({ title: "Already booked", variant: "destructive" }); return;
      }
      const seats = parseInt(seatsRequested);
      if (isNaN(seats) || seats < 1 || seats > trip.seats_available) {
        toast({ title: "Invalid seats", description: `Available: ${trip.seats_available}`, variant: "destructive" }); return;
      }
      const { data: confirmed } = await supabase.from("bookings")
        .select("seats_requested").eq("trip_id", trip.id).in("status", ["pending", "confirmed"]);
      const taken = confirmed?.reduce((s, b) => s + b.seats_requested, 0) || 0;
      if (taken + seats > trip.seats_total) {
        toast({ title: "Not enough seats", description: `Only ${trip.seats_total - taken} remaining`, variant: "destructive" }); return;
      }
      const { error } = await supabase.from("bookings").insert({
        trip_id: trip.id, passenger_id: user.id, seats_requested: seats,
        pickup_location: trip.start_location, pickup_coords: { lat: 0, lng: 0 },
        drop_location: trip.end_location, drop_coords: { lat: 0, lng: 0 },
        status: "pending",
      });
      if (error) throw error;
      toast({ title: "Booking request sent", description: "The driver will review your request." });
      navigate("/profile");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setBookingLoading(false); }
  };

  if (loading) return <div className="theme-also bg-background min-h-screen p-16 text-center font-mono-label text-sm">LOADING TRIP…</div>;
  if (!trip) return <div className="theme-also bg-background min-h-screen p-16 text-center font-mono-label text-sm">TRIP NOT FOUND</div>;

  const formattedDate = new Date(trip.departure_time).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const perKm = trip.total_distance_km ? (trip.estimated_fuel_cost / trip.total_distance_km) : 0;

  return (
    <div className="theme-also bg-background text-foreground min-h-full">
      {/* Top utility band */}
      <div className="bg-accent text-black">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-2.5 text-center">
          <span className="font-mono-label text-xs">RESERVE NOW · BOOK YOUR SEAT IN UNDER 60 SECONDS</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
        <button onClick={() => navigate(-1)} className="font-mono-label text-xs flex items-center gap-2 mb-10 hover:text-accent transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> BACK
        </button>

        <p className="also-eyebrow mb-6">— TRIP / {trip.id.slice(0, 8).toUpperCase()}</p>
        <h1 className="font-sans text-4xl md:text-6xl font-medium text-black leading-[0.95] tracking-[-0.02em] max-w-4xl">
          {trip.start_location} → {trip.end_location}.
        </h1>

        <div className="mt-12 grid lg:grid-cols-[1.4fr_1fr] gap-8">
          {/* LEFT: map + details */}
          <div className="space-y-8">
            {trip.start_coords && trip.end_coords && (
              <div className="bg-white rounded-xl overflow-hidden border border-black/10">
                <RouteMap
                  origin={trip.start_coords}
                  destination={trip.end_coords}
                  polyline={trip.route_polyline || undefined}
                  className="w-full h-[360px]"
                />
                {trip.total_distance_km && (
                  <div className="grid grid-cols-3 border-t border-black/10">
                    <div className="p-5">
                      <p className="also-eyebrow text-black/50">DISTANCE</p>
                      <p className="font-sans text-2xl mt-1">{trip.total_distance_km.toFixed(1)} km</p>
                    </div>
                    <div className="p-5 border-l border-black/10">
                      <p className="also-eyebrow text-black/50">RATE</p>
                      <p className="font-sans text-2xl mt-1">₹{perKm.toFixed(1)}/km</p>
                    </div>
                    <div className="p-5 border-l border-black/10">
                      <p className="also-eyebrow text-black/50">SEATS</p>
                      <p className="font-sans text-2xl mt-1">{trip.seats_available}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="also-card space-y-5">
              <p className="also-eyebrow">— TRIP DETAILS</p>
              <Row icon={<MapPin className="h-4 w-4" />} label="FROM" value={trip.start_location} />
              <Row icon={<MapPin className="h-4 w-4" />} label="TO" value={trip.end_location} />
              <Row icon={<Calendar className="h-4 w-4" />} label="DEPARTURE" value={formattedDate} />
              <Row icon={<Car className="h-4 w-4" />} label="VEHICLE" value={`${trip.vehicle.type} · ${trip.vehicle.model}`} />
            </div>

            <div className="also-card flex items-center gap-5">
              <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center">
                <User className="h-6 w-6 text-black" />
              </div>
              <div className="flex-1">
                <p className="also-eyebrow text-black/50">DRIVER</p>
                <p className="font-sans text-xl tracking-tight">{trip.driver.name}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono-label text-xs px-3 py-1.5 rounded-full bg-accent text-black">
                <Star className="h-3 w-3 fill-current" /> {trip.driver.rating.toFixed(1)}
              </span>
            </div>

            <div className="bg-accent rounded-xl p-6">
              <p className="font-mono-label text-xs mb-3">— ABOUT COST SHARING</p>
              <p className="font-sans text-base text-black leading-relaxed tracking-tight">
                The displayed fuel cost is the full-journey estimate. Your contribution is computed
                from the exact kilometres you share with the driver. Fair, distance-based splitting — not profit.
              </p>
            </div>
          </div>

          {/* RIGHT: booking sticker (ALSO sticker card) */}
          <aside className="lg:sticky lg:top-20 self-start">
            <div className="also-card space-y-6">
              <div>
                <p className="also-eyebrow text-black/50">FUEL ESTIMATE — TOTAL</p>
                <p className="font-sans text-5xl tracking-[-0.04em] flex items-center mt-1">
                  <IndianRupee className="h-7 w-7" />{trip.estimated_fuel_cost.toFixed(0)}
                </p>
                <p className="font-mono-label text-xs text-accent mt-2">{trip.seats_available} SEATS LEFT</p>
              </div>

              <div className="h-px bg-black/10" />

              <div className="space-y-2">
                <Label htmlFor="seats" className="also-eyebrow text-black/60">SEATS REQUESTED</Label>
                <Input
                  id="seats" type="number" min="1" max={trip.seats_available}
                  value={seatsRequested}
                  onChange={(e) => setSeatsRequested(e.target.value)}
                  className="rounded-xl border-black h-12 text-base font-medium focus-visible:ring-accent focus-visible:border-accent"
                />
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading || !!existingBooking}
                className={`${existingBooking ? "btn-lime" : "btn-lilac"} w-full disabled:opacity-60`}
              >
                {existingBooking
                  ? `BOOKED · ${existingBooking.status.toUpperCase()}`
                  : bookingLoading
                  ? "REQUESTING…"
                  : "RESERVE NOW"}
                {!existingBooking && <ArrowRight className="h-4 w-4" />}
              </button>

              <p className="text-xs text-center text-black/50 font-sans">
                Your request is sent to the driver for approval.
              </p>
            </div>

            {/* Payment placeholder pill */}
            <div className="mt-6 also-card flex items-center justify-between">
              <div>
                <p className="also-eyebrow text-black/50">PAYMENT</p>
                <p className="font-sans text-base mt-1">UPI · COD · Razorpay</p>
              </div>
              <ArrowRight className="h-4 w-4" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-4">
    <div className="h-10 w-10 rounded-full bg-accent/30 flex items-center justify-center text-black">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="also-eyebrow text-black/50">{label}</p>
      <p className="font-sans text-base tracking-tight truncate">{value}</p>
    </div>
  </div>
);

export default TripDetail;
