import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, User, Car, IndianRupee, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RouteMap } from "@/components/RouteMap";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";

interface TripDetail {
  id: string;
  start_location: string;
  end_location: string;
  start_coords: { lat: number; lng: number };
  end_coords: { lat: number; lng: number };
  route_polyline: string | null;
  total_distance_km: number | null;
  departure_time: string;
  seats_available: number;
  seats_total: number;
  estimated_fuel_cost: number;
  driver: {
    id: string;
    name: string;
    rating: number;
  };
  vehicle: {
    type: string;
    model: string;
  };
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

  // Set up realtime bookings listener
  useRealtimeBookings({
    userId,
    onBookingUpdate: async () => {
      // Reload existing booking if present
      if (userId && id) {
        const { data } = await supabase
          .from("bookings")
          .select("*")
          .eq("trip_id", id)
          .eq("passenger_id", userId)
          .maybeSingle();
        
        setExistingBooking(data);
      }
    },
  });

  useEffect(() => {
    const checkAuthAndLoadTrip = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      try {
        const { data, error } = await supabase
          .from("trips")
          .select(`
            *,
            driver:profiles!driver_id(id, name, rating),
            vehicle:vehicles(type, model)
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setTrip({
          ...data,
          start_coords: data.start_coords as { lat: number; lng: number },
          end_coords: data.end_coords as { lat: number; lng: number },
        });

        // Check for existing booking
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("*")
          .eq("trip_id", id)
          .eq("passenger_id", session.user.id)
          .in("status", ["pending", "confirmed"])
          .maybeSingle();

        setExistingBooking(bookingData);
      } catch (error: any) {
        toast({
          title: "Error loading trip",
          description: error.message,
          variant: "destructive",
        });
        navigate("/find-rides");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadTrip();
  }, [id, navigate, toast]);

  const handleBooking = async () => {
    if (!trip) return;

    try {
      setBookingLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (user.id === trip.driver.id) {
        toast({
          title: "Cannot book own trip",
          description: "You cannot book a ride you posted",
          variant: "destructive",
        });
        return;
      }

      // Check for existing booking
      if (existingBooking) {
        toast({
          title: "Already booked",
          description: "You already have a booking for this trip",
          variant: "destructive",
        });
        return;
      }

      const seats = parseInt(seatsRequested);
      if (isNaN(seats) || seats < 1) {
        toast({
          title: "Invalid seats",
          description: "Please enter a valid number of seats",
          variant: "destructive",
        });
        return;
      }

      if (seats > trip.seats_available) {
        toast({
          title: "Not enough seats",
          description: `Only ${trip.seats_available} seats available`,
          variant: "destructive",
        });
        return;
      }

      // Check if total confirmed bookings + this request would exceed available seats
      const { data: confirmedBookings } = await supabase
        .from("bookings")
        .select("seats_requested")
        .eq("trip_id", trip.id)
        .in("status", ["pending", "confirmed"]);

      const totalBookedSeats = confirmedBookings?.reduce(
        (sum, booking) => sum + booking.seats_requested,
        0
      ) || 0;

      if (totalBookedSeats + seats > trip.seats_total) {
        toast({
          title: "Not enough seats",
          description: `Only ${trip.seats_total - totalBookedSeats} seats remaining after pending bookings`,
          variant: "destructive",
        });
        return;
      }

      // Create booking with placeholder data
      const { error } = await supabase.from("bookings").insert({
        trip_id: trip.id,
        passenger_id: user.id,
        seats_requested: seats,
        pickup_location: trip.start_location,
        pickup_coords: { lat: 0, lng: 0 },
        drop_location: trip.end_location,
        drop_coords: { lat: 0, lng: 0 },
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Booking request sent!",
        description: "The driver will review your request",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error booking ride",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p className="text-center text-muted-foreground">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p className="text-center text-muted-foreground">Trip not found</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(trip.departure_time).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {trip.start_coords && trip.end_coords && (
              <Card className="p-6 shadow-elevated border-border/50">
                <h2 className="text-2xl font-bold mb-4">Route</h2>
                <RouteMap
                  origin={trip.start_coords}
                  destination={trip.end_coords}
                  polyline={trip.route_polyline || undefined}
                  className="w-full h-[350px] rounded-lg"
                />
                {trip.total_distance_km && (
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.total_distance_km.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      <span>₹{(trip.estimated_fuel_cost / trip.total_distance_km).toFixed(1)}/km</span>
                    </div>
                  </div>
                )}
              </Card>
            )}

            <Card className="p-8 shadow-elevated border-border/50">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-4">Trip Details</h1>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="text-lg font-semibold">{trip.start_location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">To</p>
                        <p className="text-lg font-semibold">{trip.end_location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Departure</p>
                        <p className="text-lg font-semibold">{formattedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicle</p>
                        <p className="text-lg font-semibold capitalize">
                          {trip.vehicle.type} - {trip.vehicle.model}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{trip.driver.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {trip.driver.rating.toFixed(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Driver</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/30 border-secondary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-secondary">💡</span> About Cost Sharing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The displayed fuel cost is an estimate for the entire journey. Your actual contribution 
                will be calculated based on the exact distance you share with the driver. CRSP ensures 
                fair, distance-based cost splitting—not profit-making.
              </p>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 shadow-elevated border-border/50 sticky top-24">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Available Seats</span>
                    <Badge variant="secondary" className="rounded-full">
                      {trip.seats_available} left
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    <span className="text-3xl font-bold">{trip.estimated_fuel_cost.toFixed(0)}</span>
                    <span className="text-sm text-muted-foreground">est. total</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Number of Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max={trip.seats_available}
                    value={seatsRequested}
                    onChange={(e) => setSeatsRequested(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleBooking}
                  className="w-full rounded-full" 
                  size="lg"
                  disabled={bookingLoading || !!existingBooking}
                >
                  {existingBooking 
                    ? `Already Booked (${existingBooking.status})` 
                    : bookingLoading 
                    ? "Requesting..." 
                    : "Request to Book"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Your request will be sent to the driver for approval
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
