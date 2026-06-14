import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, MapPin, Users, Car, Headphones, Bike, Truck } from "lucide-react";

const Landing = () => {
  useEffect(() => {
    if (window.location.hash === "#hero") {
      requestAnimationFrame(() => {
        document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  return (
  <div className="min-h-full bg-background text-foreground">
    {/* Hero */}
    <section id="hero" className="gradient-hero px-6 md:px-12 lg:px-20 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="chip-indigo mb-6">India's friendliest rideshare</span>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-foreground mt-4">
            Ride Smarter<br/>Across India
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-md leading-relaxed">
            Affordable Bike, Auto & Cab rides across 100+ cities. Share routes,
            split fuel, move clean — together.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/find-rides" className="btn-primary">
              Book a Ride <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/become-captain" className="btn-outline-soft">
              Become a Captain
            </Link>
          </div>
        </div>

        {/* Decorative phone preview */}
        <div className="relative">
          <div className="absolute -inset-8 bg-[hsl(var(--indigo-soft))] rounded-[3rem] -z-10 blur-2xl opacity-60" />
          <div className="bg-white rounded-[2rem] border border-border shadow-xl p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-sm">Your route</span>
              <span className="chip-mint">Live</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="h-2.5 w-2.5 mt-2 rounded-full bg-[hsl(var(--mint))]" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="font-semibold">Panjagutta, Hyderabad</p>
                </div>
              </div>
              <div className="ml-1 border-l-2 border-dashed border-border h-6" />
              <div className="flex items-start gap-3">
                <span className="h-2.5 w-2.5 mt-2 rounded-full bg-[hsl(var(--coral))]" />
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-semibold">Hitech City, Hyderabad</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted py-3"><Bike className="h-5 w-5 mx-auto text-[hsl(var(--primary))]" /><p className="text-[10px] mt-1 font-medium">Bike</p></div>
              <div className="rounded-xl bg-muted py-3"><Car className="h-5 w-5 mx-auto text-[hsl(var(--primary))]" /><p className="text-[10px] mt-1 font-medium">Cab</p></div>
              <div className="rounded-xl bg-muted py-3"><Truck className="h-5 w-5 mx-auto text-[hsl(var(--primary))]" /><p className="text-[10px] mt-1 font-medium">Auto</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="px-6 md:px-12 lg:px-20 -mt-10 mb-20 relative z-10">
      <div className="max-w-[1280px] mx-auto bg-white rounded-3xl border border-border p-6 md:p-8 shadow-lg grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: MapPin, value: "100+", label: "Cities" },
          { icon: Users, value: "10M+", label: "Happy Users" },
          { icon: Car, value: "50K+", label: "Drivers" },
          { icon: Headphones, value: "24/7", label: "Support" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-2xl bg-[hsl(var(--indigo-soft))] flex items-center justify-center mb-3">
              <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <p className="font-display text-2xl">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* How it works */}
    <section className="px-6 md:px-12 lg:px-20 pb-24">
      <div className="max-w-[1280px] mx-auto">
        <span className="chip-mint mb-3">How it works</span>
        <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl">
          Three steps. Then you're moving.
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { n: "01", t: "Pick your route", d: "Tell us where you're going. Pickup, drop, departure time." },
            { n: "02", t: "Choose your ride", d: "Bike, auto or cab — see real seats, real fuel splits." },
            { n: "03", t: "Move together", d: "Confirm. Share the road. Split the fuel. Cut emissions." },
          ].map((s) => (
            <div key={s.n} className="lambo-card">
              <p className="font-mono-label text-[hsl(var(--primary))]">{s.n}</p>
              <h3 className="font-display text-xl mt-2">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
  );
};

export default Landing;
