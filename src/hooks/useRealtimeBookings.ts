import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseRealtimeBookingsProps {
  userId: string | undefined;
  onBookingUpdate?: () => void;
}

export const useRealtimeBookings = ({ userId, onBookingUpdate }: UseRealtimeBookingsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        async (payload) => {
          console.log('Booking change detected:', payload);

          // Handle INSERT events (new booking requests)
          if (payload.eventType === 'INSERT') {
            const newBooking = payload.new;
            
            // Check if this user is the driver for this trip
            const { data: trip } = await supabase
              .from('trips')
              .select('driver_id, start_location, end_location')
              .eq('id', newBooking.trip_id)
              .single();

            if (trip?.driver_id === userId) {
              // Fetch passenger info
              const { data: passenger } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', newBooking.passenger_id)
                .single();

              toast({
                title: "New Booking Request! 🚗",
                description: `${passenger?.name || 'A passenger'} wants to join your ride from ${trip.start_location} to ${trip.end_location}`,
              });
              
              onBookingUpdate?.();
            }
          }

          // Handle UPDATE events (status changes)
          if (payload.eventType === 'UPDATE') {
            const oldBooking = payload.old;
            const newBooking = payload.new;

            // Check if status changed
            if (oldBooking.status !== newBooking.status) {
              // If this user is the passenger
              if (newBooking.passenger_id === userId) {
                if (newBooking.status === 'confirmed') {
                  toast({
                    title: "Booking Confirmed! ✅",
                    description: "Your ride request has been accepted by the driver",
                  });
                } else if (newBooking.status === 'cancelled') {
                  toast({
                    title: "Booking Cancelled ❌",
                    description: "Your ride request was declined",
                    variant: "destructive",
                  });
                }
                
                onBookingUpdate?.();
              }

              // If this user is the driver
              const { data: trip } = await supabase
                .from('trips')
                .select('driver_id')
                .eq('id', newBooking.trip_id)
                .single();

              if (trip?.driver_id === userId && newBooking.status !== 'pending') {
                onBookingUpdate?.();
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast, onBookingUpdate]);
};
