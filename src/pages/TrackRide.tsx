import { Link } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, Shield, MapPin } from "lucide-react";

const TrackRide = () => (
  <div className="min-h-full bg-background px-4 sm:px-6 md:px-10 py-8 max-w-[900px] mx-auto">
    <div className="flex items-center justify-between mb-4">
      <Link to="/dashboard" className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <button className="h-10 w-10 rounded-full bg-white border border-border flex items-center justify-center">
        <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
      </button>
    </div>

    <div className="rounded-3xl bg-[hsl(var(--indigo-soft))] h-64 md:h-80 mb-6 flex items-center justify-center relative overflow-hidden">
      <MapPin className="h-12 w-12 text-[hsl(var(--primary))]" />
      <span className="absolute bottom-4 right-4 chip-indigo">1.2 km</span>
    </div>

    <div className="lambo-card">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold">
          R
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg">Ramesh Kumar</p>
          <p className="text-xs text-muted-foreground">★ 4.8 · TS12FG1877 · Bajaj Pulsar</p>
        </div>
        <button className="h-11 w-11 rounded-full bg-[hsl(var(--mint-soft))] flex items-center justify-center">
          <Phone className="h-4 w-4 text-[hsl(var(--mint))]" />
        </button>
        <button className="h-11 w-11 rounded-full bg-[hsl(var(--indigo-soft))] flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-[hsl(var(--primary))]" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">ETA</p>
          <p className="font-display text-xl mt-1">4 min</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="font-display text-xl mt-1">1.2 km</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-[hsl(var(--primary))] mb-3">Driver is on the way</p>
        <div className="flex items-center gap-1">
          {["Assigned", "On the way", "Arrived", "Started", "Complete"].map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i <= 1 ? "bg-[hsl(var(--primary))]" : "bg-muted"}`} />
              <p className="text-[9px] text-muted-foreground mt-1.5 text-center">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default TrackRide;
