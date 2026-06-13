import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell, Search, ChevronRight, Bike, Car, Truck, MapPin, Zap,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("there");
  const [city, setCity] = useState("Hyderabad");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth"); return; }
      const n = (user.user_metadata as any)?.name || user.email?.split("@")[0];
      if (n) setName(n);
    });
  }, [navigate]);

  const rides = [
    { name: "Car Ride", desc: "Comfort & Safe", icon: Car, color: "indigo" },
    { name: "Bike Ride", desc: "Fast & Affordable", icon: Bike, color: "mint" },
    { name: "Auto Ride", desc: "Budget Friendly", icon: Truck, color: "coral" },
  ];

  return (
    <div className="min-h-full bg-background px-4 sm:px-6 md:px-10 py-8 max-w-[1100px] mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Hello {name} <span className="inline-block">👋</span></h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Panjagutta, {city}
          </p>
        </div>
      </div>

      {/* Become captain banner */}
      <Link to="/become-captain" className="block rounded-3xl bg-[hsl(var(--primary))] text-white p-5 md:p-6 mb-6 hover:scale-[1.01] transition-transform">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg md:text-xl">Make more money!</p>
            <p className="text-sm text-white/80 mt-1">Become a captain →</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6" strokeWidth={2.5} />
          </div>
        </div>
      </Link>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Where do you want to go?"
          onClick={() => navigate("/find-rides")}
          readOnly
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-border text-sm cursor-pointer focus:outline-none focus:border-[hsl(var(--primary))]"
        />
      </div>

      {/* Choose a ride */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Choose a Ride</h2>
          <Link to="/find-rides" className="text-xs font-semibold text-[hsl(var(--primary))]">View All</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {rides.map((r) => (
            <Link key={r.name} to="/find-rides"
              className="rounded-2xl bg-white border border-border p-4 hover:border-[hsl(var(--primary))] transition-colors text-center">
              <div className="h-12 w-12 rounded-xl bg-muted mx-auto flex items-center justify-center mb-2">
                <r.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <p className="font-semibold text-sm">{r.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Nearby vehicles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Nearby Vehicles</h2>
          <Link to="/find-rides" className="text-xs font-semibold text-[hsl(var(--primary))]">View All</Link>
        </div>
        <div className="rounded-2xl bg-white border border-border h-44 flex items-center justify-center text-sm text-muted-foreground">
          Live map preview — coming up
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
