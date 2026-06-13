import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Gift, Users } from "lucide-react";

const Rewards = () => (
  <div className="min-h-full bg-background px-4 sm:px-6 md:px-10 py-8 max-w-[700px] mx-auto">
    <div className="flex items-center gap-3 mb-6">
      <Link to="/dashboard" className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="font-display text-xl">Rewards</h1>
    </div>

    <div className="rounded-3xl p-6 mb-6 text-white"
         style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--violet)) 100%)" }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xl">Invite Your Friends</p>
          <p className="text-sm text-white/80 mt-1">Earn ₹100 on every referral</p>
          <div className="mt-4 bg-white/15 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider">Referral Code</p>
              <p className="font-display tracking-wider">RAID100</p>
            </div>
            <button className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <Gift className="h-20 w-20 opacity-80 hidden sm:block" />
      </div>
    </div>

    <h2 className="font-display text-lg mb-3">Your Rewards</h2>
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="lambo-card">
        <p className="text-xs text-muted-foreground">Total Earnings</p>
        <p className="font-display text-2xl mt-1">₹1,250</p>
      </div>
      <div className="lambo-card">
        <p className="text-xs text-muted-foreground">Total Referrals</p>
        <p className="font-display text-2xl mt-1">12</p>
      </div>
    </div>

    <h2 className="font-display text-lg mb-3">Recent Rewards</h2>
    <div className="space-y-3 mb-6">
      {[
        { d: "25 May 2024", v: 100 },
        { d: "18 May 2024", v: 100 },
      ].map((r) => (
        <div key={r.d} className="lambo-card flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--mint-soft))] flex items-center justify-center">
            <Users className="h-4 w-4 text-[hsl(var(--mint))]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Referral Bonus</p>
            <p className="text-xs text-muted-foreground">{r.d}</p>
          </div>
          <p className="font-display text-base text-[hsl(var(--mint))]">+₹{r.v}</p>
        </div>
      ))}
    </div>

    <button className="w-full h-14 rounded-2xl bg-[hsl(var(--coral))] text-white font-semibold text-sm hover:opacity-90 transition">
      Invite Now
    </button>
  </div>
);

export default Rewards;
