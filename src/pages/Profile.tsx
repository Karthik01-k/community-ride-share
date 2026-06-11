import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Car, MapPin, Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookingRequests } from "@/components/BookingRequests";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";

interface Profile {
  name: string; rating: number;
  total_rides_as_driver: number;
  total_rides_as_passenger: number;
  total_co2_saved_kg: number;
}
interface Booking {
  id: string; trip_id: string; seats_requested: number;
  pickup_location: string; drop_location: string;
  status: string; cost_contribution: number | null;
  trip: { start_location: string; end_location: string; departure_time: string; driver: { name: string } };
}
interface Trip {
  id: string; start_location: string; end_location: string;
  departure_time: string; seats_available: number;
  estimated_fuel_cost: number; status: string;
  bookings?: Array<{ id: string; seats_requested: number; pickup_location: string; drop_location: string; status: string; passenger: { name: string; rating: number } }>;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();

  const refreshData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: tripsData } = await supabase.from("trips").select(`*, bookings(id, seats_requested, pickup_location, drop_location, status, passenger:profiles!passenger_id(name, rating))`).eq("driver_id", session.user.id).order("created_at", { ascending: false });
    if (tripsData) setTrips(tripsData);
    const { data: bookingsData } = await supabase.from("bookings").select(`*, trip:trips(start_location, end_location, departure_time, driver:profiles!driver_id(name))`).eq("passenger_id", session.user.id).order("created_at", { ascending: false });
    if (bookingsData) setBookings(bookingsData);
  };

  useRealtimeBookings({ userId, onBookingUpdate: refreshData });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
      try {
        const { data: p, error: pe } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (pe) throw pe; setProfile(p);
        await refreshData();
      } catch (error: any) {
        toast({ title: "Error loading profile", description: error.message, variant: "destructive" });
      } finally { setLoading(false); }
    };
    load();
  }, [navigate, toast]);

  if (loading) {
    return <div className="p-16 text-center font-display text-muted-foreground">LOADING PROFILE…</div>;
  }
  if (!profile) {
    return <div className="p-16 text-center font-display text-muted-foreground">PROFILE NOT FOUND</div>;
  }

  const trustLabel = profile.rating >= 4 ? "EXCELLENT" : profile.rating >= 3 ? "GOOD" : "BUILDING";

  return (
    <div className="bg-background text-foreground min-h-full">
      {/* Identity stage */}
      <section className="bg-[hsl(0_0%_8%)] px-6 md:px-12 lg:px-20 py-16 border-b border-border">
        <div className="max-w-[1440px] mx-auto flex items-start gap-6 flex-wrap">
          <div className="h-24 w-24 flex items-center justify-center border border-border bg-[hsl(0_0%_10%)]">
            <User className="h-10 w-10 text-giallo" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-[260px]">
            <p className="eyebrow text-giallo mb-3">— DRIVER / PASSENGER FILE</p>
            <h1 className="font-display text-5xl md:text-7xl text-white leading-[0.95]">{profile.name.toUpperCase()}</h1>
            <div className="flex items-center gap-4 mt-4 font-display text-xs text-white/70">
              <span className="flex items-center gap-1.5 text-giallo"><Star className="h-3.5 w-3.5 fill-current" /> {profile.rating.toFixed(1)}</span>
              <span>·</span>
              <span>TRUST · {trustLabel}</span>
              <span>·</span>
              <span>MEMBER · 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="px-6 md:px-12 lg:px-20 py-12 border-b border-border">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            { v: profile.total_rides_as_driver, l: "AS DRIVER", n: "01" },
            { v: profile.total_rides_as_passenger, l: "AS PASSENGER", n: "02" },
            { v: `${(profile.total_co2_saved_kg/1000).toFixed(1)}T`, l: "CO₂ OFFSET", n: "03" },
            { v: profile.total_rides_as_driver + profile.total_rides_as_passenger, l: "TOTAL TRIPS", n: "04" },
          ].map((s) => (
            <div key={s.l} className="bg-background p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="font-display text-[10px] text-muted-foreground">{s.n}</span>
              </div>
              <p className="font-display text-4xl text-foreground leading-none">{s.v}</p>
              <p className="font-display text-[10px] text-muted-foreground mt-3">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-[1440px] mx-auto">
          <Tabs defaultValue="driver">
            <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 mb-8">
              <TabsTrigger value="driver" className="font-display text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-giallo data-[state=active]:text-giallo data-[state=active]:bg-transparent px-6 py-3">AS DRIVER</TabsTrigger>
              <TabsTrigger value="passenger" className="font-display text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-giallo data-[state=active]:text-giallo data-[state=active]:bg-transparent px-6 py-3">AS PASSENGER</TabsTrigger>
            </TabsList>

            <TabsContent value="driver">
              {trips.length === 0 ? (
                <div className="lambo-card p-16 text-center">
                  <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <p className="font-display text-lg text-foreground mb-4">NO RIDES POSTED.</p>
                  <a href="/post-ride" className="btn-giallo">POST A RIDE <ArrowRight className="h-4 w-4" /></a>
                </div>
              ) : (
                <div className="space-y-6">
                  {trips.map((trip) => (
                    <div key={trip.id} className="space-y-4">
                      <div className="lambo-card p-6 flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[240px]">
                          <p className="font-display text-lg text-foreground">
                            {trip.start_location} <span className="text-giallo">→</span> {trip.end_location}
                          </p>
                          <p className="font-display text-[10px] text-muted-foreground mt-2">
                            {new Date(trip.departure_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).toUpperCase()}
                          </p>
                          <div className="flex gap-3 mt-3 font-display text-[10px]">
                            <span className="text-giallo">{trip.seats_available} SEATS</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{trip.status.toUpperCase()}</span>
                            {trip.bookings && trip.bookings.filter(b => b.status === "pending").length > 0 && (
                              <>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-giallo">{trip.bookings.filter(b => b.status === "pending").length} PENDING</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button onClick={() => navigate(`/trip/${trip.id}`)} className="btn-outline-lambo">
                          VIEW <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                      {trip.bookings && trip.bookings.length > 0 && (
                        <BookingRequests tripId={trip.id} bookings={trip.bookings} onUpdate={refreshData} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="passenger">
              {bookings.length === 0 ? (
                <div className="lambo-card p-16 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <p className="font-display text-lg text-foreground mb-4">NO BOOKINGS YET.</p>
                  <a href="/find-rides" className="btn-giallo">FIND RIDES <ArrowRight className="h-4 w-4" /></a>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div key={b.id} className="lambo-card p-6 flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[240px]">
                        <p className="font-display text-lg text-foreground">
                          {b.pickup_location} <span className="text-giallo">→</span> {b.drop_location}
                        </p>
                        <p className="font-display text-[10px] text-muted-foreground mt-2">
                          DRIVER · {b.trip.driver.name.toUpperCase()}
                        </p>
                        <p className="font-display text-[10px] text-muted-foreground">
                          {new Date(b.trip.departure_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).toUpperCase()}
                        </p>
                        <div className="flex gap-3 mt-3 font-display text-[10px]">
                          <span className="text-giallo">{b.seats_requested} SEAT(S)</span>
                          <span className="text-muted-foreground">·</span>
                          <span className={b.status === "confirmed" ? "text-giallo" : b.status === "cancelled" ? "text-destructive" : "text-muted-foreground"}>
                            {b.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/trip/${b.trip_id}`)} className="btn-outline-lambo">
                        VIEW <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
