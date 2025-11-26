import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Star, Leaf, TrendingUp, Car, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookingRequests } from "@/components/BookingRequests";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";

interface Profile {
  name: string;
  rating: number;
  total_rides_as_driver: number;
  total_rides_as_passenger: number;
  total_co2_saved_kg: number;
}

interface Booking {
  id: string;
  trip_id: string;
  seats_requested: number;
  pickup_location: string;
  drop_location: string;
  status: string;
  cost_contribution: number | null;
  trip: {
    start_location: string;
    end_location: string;
    departure_time: string;
    driver: {
      name: string;
    };
  };
}

interface Trip {
  id: string;
  start_location: string;
  end_location: string;
  departure_time: string;
  seats_available: number;
  estimated_fuel_cost: number;
  status: string;
  bookings?: Array<{
    id: string;
    seats_requested: number;
    pickup_location: string;
    drop_location: string;
    status: string;
    passenger: {
      name: string;
      rating: number;
    };
  }>;
}

const Profile = () => {
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

    // Refresh trips with bookings
    const { data: tripsData } = await supabase
      .from("trips")
      .select(`
        *,
        bookings(
          id,
          seats_requested,
          pickup_location,
          drop_location,
          status,
          passenger:profiles!passenger_id(name, rating)
        )
      `)
      .eq("driver_id", session.user.id)
      .order("created_at", { ascending: false });

    if (tripsData) setTrips(tripsData);

    // Refresh bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        *,
        trip:trips(
          start_location,
          end_location,
          departure_time,
          driver:profiles!driver_id(name)
        )
      `)
      .eq("passenger_id", session.user.id)
      .order("created_at", { ascending: false });

    if (bookingsData) setBookings(bookingsData);
  };

  // Set up realtime bookings listener
  useRealtimeBookings({
    userId,
    onBookingUpdate: refreshData,
  });

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch bookings as passenger
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            *,
            trip:trips(
              start_location,
              end_location,
              departure_time,
              driver:profiles!driver_id(name)
            )
          `)
          .eq("passenger_id", session.user.id)
          .order("created_at", { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);

        // Fetch trips as driver with bookings
        const { data: tripsData, error: tripsError } = await supabase
          .from("trips")
          .select(`
            *,
            bookings(
              id,
              seats_requested,
              pickup_location,
              drop_location,
              status,
              passenger:profiles!passenger_id(name, rating)
            )
          `)
          .eq("driver_id", session.user.id)
          .order("created_at", { ascending: false });

        if (tripsError) throw tripsError;
        setTrips(tripsData || []);
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadProfile();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p className="text-center text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p className="text-center text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="space-y-8">
          <Card className="p-8 shadow-elevated border-border/50">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl bg-primary/10">
                <User className="h-16 w-16 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <Badge variant="secondary" className="rounded-full">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {profile.rating.toFixed(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {profile.total_rides_as_driver}
                    </p>
                    <p className="text-sm text-muted-foreground">Rides as Driver</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {profile.total_rides_as_passenger}
                    </p>
                    <p className="text-sm text-muted-foreground">Rides as Passenger</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">
                      {(profile.total_co2_saved_kg / 1000).toFixed(1)}t
                    </p>
                    <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {profile.total_rides_as_driver + profile.total_rides_as_passenger}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Trips</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-card border-secondary/20">
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold">Eco Impact</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Your contribution to reducing carbon emissions through shared rides
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trees Equivalent</span>
                  <span className="font-semibold">~{Math.floor(profile.total_co2_saved_kg / 20)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fuel Saved (est.)</span>
                  <span className="font-semibold">~{Math.floor(profile.total_co2_saved_kg / 2.3)}L</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-card border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-bold">Community Standing</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Your trust and reliability in the CRSP community
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trust Level</span>
                  <Badge variant="secondary">
                    {profile.rating >= 4 ? "Excellent" : profile.rating >= 3 ? "Good" : "Building"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="font-semibold">2024</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 shadow-card">
            <Tabs defaultValue="driver" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="driver" className="flex-1">As Driver</TabsTrigger>
                <TabsTrigger value="passenger" className="flex-1">As Passenger</TabsTrigger>
              </TabsList>

              <TabsContent value="driver">
                {trips.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Your posted rides will appear here</p>
                    <Button asChild className="mt-4 rounded-full" variant="secondary">
                      <a href="/post-ride">Post a Ride</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trips.map((trip) => (
                      <div key={trip.id} className="space-y-4">
                        <Card className="p-4 border-border/50 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{trip.start_location}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-semibold">{trip.end_location}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(trip.departure_time).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">{trip.seats_available} seats left</Badge>
                                <Badge variant={trip.status === "open" ? "default" : "outline"}>
                                  {trip.status}
                                </Badge>
                                {trip.bookings && trip.bookings.filter(b => b.status === "pending").length > 0 && (
                                  <Badge variant="default" className="bg-accent">
                                    {trip.bookings.filter(b => b.status === "pending").length} pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/trip/${trip.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </Card>
                        {trip.bookings && trip.bookings.length > 0 && (
                          <BookingRequests
                            tripId={trip.id}
                            bookings={trip.bookings}
                            onUpdate={refreshData}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="passenger">
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Your booked rides will appear here</p>
                    <Button asChild className="mt-4 rounded-full">
                      <a href="/find-rides">Find Rides</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="p-4 border-border/50 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{booking.pickup_location}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-semibold">{booking.drop_location}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Driver: {booking.trip.driver.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.trip.departure_time).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">{booking.seats_requested} seat(s)</Badge>
                              <Badge 
                                variant={
                                  booking.status === "confirmed" ? "default" :
                                  booking.status === "pending" ? "outline" :
                                  "destructive"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/trip/${booking.trip_id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
