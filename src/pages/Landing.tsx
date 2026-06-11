import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Calendar, Leaf, Shield, Users, Play } from "lucide-react";
import EcoStats from "@/components/EcoStats";

const Landing = () => {
  return (
    <div className="bg-background text-foreground">
      {/* ============ HERO ============ */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden bg-[hsl(0_0%_8%)]">
        {/* Cinematic backdrop */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 70% 40%, hsl(45 100% 50% / 0.18), transparent 60%), linear-gradient(180deg, #0a0a0a 0%, #181818 60%, #202020 100%)",
          }}
        />
        {/* Faux road lines */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-30 pointer-events-none"
             style={{
               background:
                 "repeating-linear-gradient(90deg, transparent 0 80px, hsl(45 100% 50% / 0.4) 80px 120px)",
               maskImage: "linear-gradient(180deg, transparent, black)",
             }} />

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-16 pt-32">
          <div className="max-w-[1440px] mx-auto">
            <p className="eyebrow mb-6 text-giallo">— EP. 01 / COMMUNITY RIDE SHARING</p>

            <h1 className="font-display text-white leading-[0.92] tracking-[0.023em]
                           text-[56px] sm:text-[88px] lg:text-[120px] max-w-[12ch]">
              SHARE THE<br/>ROAD.<br/>
              <span className="text-giallo">SPLIT THE FUEL.</span>
            </h1>

            <p className="mt-8 max-w-md font-sans text-base text-white/70 leading-relaxed">
              CRSP connects travellers going the same way. No surge. No profit.
              Just distance-based cost sharing across India.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/find-rides" className="btn-giallo">
                FIND A RIDE <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/post-ride" className="btn-outline-lambo">
                POST A RIDE <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Carousel pips */}
            <div className="mt-16 flex items-center justify-between border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-10 bg-white" />
                <span className="h-[2px] w-10 bg-white/30" />
                <span className="h-[2px] w-10 bg-white/30" />
                <span className="font-display text-xs text-white/60 ml-3">01 / 03</span>
              </div>
              <button className="h-10 w-10 border border-white/40 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                <Play className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS (light marble band) ============ */}
      <section className="bg-[hsl(0_0%_96%)] text-black py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <h2 className="font-display text-4xl md:text-5xl text-black leading-none">
              IMPACT, IN NUMBERS
            </h2>
            <Link to="/profile" className="btn-ghost-arrow text-black">
              DISCOVER YOUR IMPACT <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <EcoStats />
        </div>
      </section>

      {/* ============ FEATURES — dark stage ============ */}
      <section className="bg-background py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <div>
              <p className="eyebrow mb-4">— WHY CRSP</p>
              <h2 className="font-display text-4xl md:text-6xl text-white max-w-3xl leading-[1.05]">
                BUILT FOR COMMUNITY.<br/>NOT FOR COMMISSION.
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-border">
            {[
              { Icon: Leaf, title: "ECO-FIRST", body: "Every shared seat cuts a car off the road. Track CO₂ saved trip by trip.", n: "01" },
              { Icon: Shield, title: "FAIR SPLIT", body: "Costs computed by the kilometre you actually share. No surge, no fees.", n: "02" },
              { Icon: Users, title: "VERIFIED RIDERS", body: "Ratings, real profiles, and a community that vouches for each other.", n: "03" },
            ].map(({ Icon, title, body, n }) => (
              <div key={title} className="bg-[hsl(0_0%_10%)] p-10 group hover:bg-[hsl(0_0%_13%)] transition-colors">
                <div className="flex items-start justify-between mb-12">
                  <Icon className="h-10 w-10 text-giallo" strokeWidth={1.5} />
                  <span className="font-display text-xs text-white/40">{n}</span>
                </div>
                <h3 className="font-display text-2xl text-white mb-4">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STORY GRID ============ */}
      <section className="bg-[hsl(0_0%_96%)] text-black py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <h2 className="font-display text-4xl md:text-5xl text-black leading-none">
              ON THE ROAD
            </h2>
            <Link to="/find-rides" className="btn-ghost-arrow text-black">
              ALL ROUTES <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { date: "11.06.2026", title: "DELHI → JAIPUR", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80" },
              { date: "11.06.2026", title: "BANGALORE → MYSORE", img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80" },
              { date: "11.06.2026", title: "MUMBAI → PUNE", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80" },
            ].map((c) => (
              <article key={c.title}>
                <p className="font-display text-[10px] text-[hsl(var(--steel-mid))] mb-3">{c.date}</p>
                <h3 className="font-display text-lg text-black mb-4">{c.title}</h3>
                <img src={c.img} alt={c.title} loading="lazy"
                     className="w-full aspect-[4/3] object-cover" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EVENT BAND ============ */}
      <section className="relative bg-[hsl(0_0%_8%)] py-24 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30"
             style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(45 100% 50% / 0.3), transparent 50%)" }} />
        <div className="relative max-w-[1440px] mx-auto">
          <p className="eyebrow text-giallo mb-6">— JOIN THE MOVEMENT</p>
          <h2 className="font-display text-5xl md:text-7xl text-white leading-[0.95] max-w-3xl">
            YOUR NEXT JOURNEY<br/>STARTS WITH<br/>A SHARED SEAT.
          </h2>
          <div className="mt-10">
            <Link to="/auth" className="btn-giallo">
              GET STARTED FREE <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(0_0%_6%)] text-white/50 py-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="font-display text-sm text-white">CRSP.</span>
          <span className="font-display text-[10px]">© 2026 — COMMUNITY RIDE SHARING PROTOCOL</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
