import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bike, Car, Truck, ArrowRight } from "lucide-react";

const tabs = ["Upcoming", "Completed", "Cancelled"] as const;

const MyRides = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<typeof tabs[number]>("Upcoming");
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data } = await supabase
        .from("bookings")
        .select("id, status, seats_requested, trip:trips(id, start_location, end_location, departure_time, estimated_fuel_cost, vehicle:vehicles(type, model))")
        .eq("passenger_id", user.id)
        .order("created_at", { ascending: false });
      setRides(data ?? []);
    })();
  }, [navigate]);

  const filtered = rides.filter((r) => {
    if (tab === "Upcoming") return ["pending", "confirmed"].includes(r.status);
    if (tab === "Completed") return r.status === "completed";
    return r.status === "rejected" || r.status === "cancelled";
  });

  const iconFor = (t: string) => t === "bike" ? Bike : t === "auto" ? Truck : Car;

  return (
    <div className="min-h-full bg-background px-4 sm:px-6 md:px-10 py-8 max-w-[900px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl">My Rides</h1>
      </div>

      <div className="grid grid-cols-3 p-1 bg-muted rounded-2xl mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-2.5 rounded-xl text-sm font-semibold transition ${tab === t ? "bg-[hsl(var(--primary))] text-white shadow-sm" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="lambo-card text-center py-12">
            <p className="text-sm text-muted-foreground">No {tab.toLowerCase()} rides yet.</p>
            <Link to="/find-rides" className="btn-primary mt-4 inline-flex">Book a Ride</Link>
          </div>
        )}
        {filtered.map((r) => {
          const Icon = iconFor(r.trip?.vehicle?.type || "car");
          return (
            <Link key={r.id} to={`/trip/${r.trip?.id}`} className="lambo-card flex items-center gap-4 hover:border-[hsl(var(--primary))] transition-colors">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {new Date(r.trip?.departure_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="font-semibold text-sm truncate">{r.trip?.start_location} → {r.trip?.end_location}</p>
                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{r.trip?.vehicle?.type} ride</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-base">₹{r.trip?.estimated_fuel_cost}</p>
                <span className={`chip ${r.status === "confirmed" ? "chip-mint" : "chip-indigo"} mt-1`}>
                  {r.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length > 0 && (
        <Link to="/find-rides" className="btn-outline-soft w-full mt-6">
          View All Rides <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
};

export default MyRides;
