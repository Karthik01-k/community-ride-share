import { useState } from "react";
import { ArrowRight, Check, MapPin, Star, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookingRequest {
  id: string; seats_requested: number;
  pickup_location: string; drop_location: string;
  status: string;
  passenger: { name: string; rating: number };
}
interface BookingRequestsProps {
  tripId: string;
  bookings: BookingRequest[];
  onUpdate: () => void;
}

export const BookingRequests = ({ tripId, bookings, onUpdate }: BookingRequestsProps) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAccept = async (bookingId: string, seats: number) => {
    setProcessing(bookingId);
    try {
      const { error: e1 } = await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId);
      if (e1) throw e1;
      const { data: trip } = await supabase.from("trips").select("seats_available").eq("id", tripId).single();
      if (trip) {
        const { error: e2 } = await supabase.from("trips").update({ seats_available: trip.seats_available - seats }).eq("id", tripId);
        if (e2) throw e2;
      }
      toast({ title: "Booking confirmed" });
      onUpdate();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setProcessing(null); }
  };

  const handleReject = async (bookingId: string) => {
    setProcessing(bookingId);
    try {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
      if (error) throw error;
      toast({ title: "Booking rejected" });
      onUpdate();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setProcessing(null); }
  };

  const pending = bookings.filter((b) => b.status === "pending");
  if (pending.length === 0) return null;

  return (
    <div className="theme-also bg-[hsl(332_38%_98%)] rounded-2xl p-6 border border-black/10">
      <p className="font-mono-label text-xs text-black mb-4">— {pending.length} PENDING REQUEST{pending.length > 1 ? "S" : ""}</p>
      <div className="space-y-3">
        {pending.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-black/10 p-5 flex items-start justify-between gap-4 flex-wrap shadow-plum-hard">
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2 mb-2 text-black">
                <User className="h-4 w-4" />
                <span className="font-sans text-base font-medium tracking-tight">{b.passenger.name}</span>
                <span className="inline-flex items-center gap-1 font-mono-label text-[10px] px-2 py-0.5 rounded-full bg-[hsl(268_96%_72%)] text-black">
                  <Star className="h-2.5 w-2.5 fill-current" /> {b.passenger.rating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-black/60 mb-2">
                <MapPin className="h-3 w-3" />
                <span>{b.pickup_location}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{b.drop_location}</span>
              </div>
              <span className="font-mono-label text-[10px] text-black/60">{b.seats_requested} SEAT(S) REQUESTED</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAccept(b.id, b.seats_requested)} disabled={processing === b.id}
                      className="btn-lilac px-5 py-3 disabled:opacity-50">
                <Check className="h-4 w-4" /> ACCEPT
              </button>
              <button onClick={() => handleReject(b.id)} disabled={processing === b.id}
                      className="btn-obsidian px-5 py-3 disabled:opacity-50">
                <X className="h-4 w-4" /> REJECT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
