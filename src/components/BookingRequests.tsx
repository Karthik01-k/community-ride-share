import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookingRequest {
  id: string;
  seats_requested: number;
  pickup_location: string;
  drop_location: string;
  status: string;
  passenger: {
    name: string;
    rating: number;
  };
}

interface BookingRequestsProps {
  tripId: string;
  bookings: BookingRequest[];
  onUpdate: () => void;
}

export const BookingRequests = ({ tripId, bookings, onUpdate }: BookingRequestsProps) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAccept = async (bookingId: string, seatsRequested: number) => {
    setProcessing(bookingId);
    try {
      // Update booking status
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      if (bookingError) throw bookingError;

      // Update available seats
      const { data: trip } = await supabase
        .from("trips")
        .select("seats_available")
        .eq("id", tripId)
        .single();

      if (trip) {
        const { error: tripError } = await supabase
          .from("trips")
          .update({ seats_available: trip.seats_available - seatsRequested })
          .eq("id", tripId);

        if (tripError) throw tripError;
      }

      toast({
        title: "Booking confirmed",
        description: "The passenger has been notified",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error confirming booking",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setProcessing(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Booking rejected",
        description: "The passenger has been notified",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error rejecting booking",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");

  if (pendingBookings.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 shadow-card border-border/50">
      <h3 className="text-xl font-bold mb-4">Pending Booking Requests</h3>
      <div className="space-y-4">
        {pendingBookings.map((booking) => (
          <Card key={booking.id} className="p-4 border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{booking.passenger.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    ⭐ {booking.passenger.rating.toFixed(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3" />
                  <span>{booking.pickup_location}</span>
                  <span>→</span>
                  <span>{booking.drop_location}</span>
                </div>
                <Badge variant="outline" className="mt-2">
                  {booking.seats_requested} seat(s) requested
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAccept(booking.id, booking.seats_requested)}
                  disabled={processing === booking.id}
                  className="rounded-full"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(booking.id)}
                  disabled={processing === booking.id}
                  className="rounded-full"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
