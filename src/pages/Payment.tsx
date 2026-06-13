import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const items = [
  { label: "Ride Fare", value: 80 },
  { label: "Platform Fee", value: 5 },
  { label: "GST", value: 3 },
];

const Payment = () => {
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="min-h-full bg-background px-4 sm:px-6 md:px-10 py-8 max-w-[640px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl">Payment Summary</h1>
      </div>

      <div className="lambo-card space-y-4">
        {items.map((i) => (
          <div key={i.label} className="flex items-center justify-between py-1 text-sm">
            <span className="text-muted-foreground">{i.label}</span>
            <span className="font-semibold">₹{i.value}</span>
          </div>
        ))}
        <div className="border-t border-border pt-4 flex items-center justify-between">
          <span className="font-display text-base">Total Amount</span>
          <span className="font-display text-xl">₹{total}</span>
        </div>
      </div>

      <h2 className="font-display text-base mt-8 mb-4">Payment Methods</h2>
      <div className="grid grid-cols-5 gap-3">
        {["Paytm", "PhonePe", "GPay", "UPI", "Card"].map((m) => (
          <button key={m} className="rounded-2xl bg-white border border-border p-3 text-center hover:border-[hsl(var(--primary))] transition-colors">
            <div className="h-10 w-10 rounded-xl bg-muted mx-auto mb-2" />
            <p className="text-[10px] font-semibold">{m}</p>
          </button>
        ))}
      </div>

      <button className="btn-mint w-full mt-8 h-14 text-base">
        Pay ₹{total}
      </button>

      <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" /> 100% Secure Payments
      </p>
    </div>
  );
};

export default Payment;
