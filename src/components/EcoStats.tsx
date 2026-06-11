import { Leaf, Users, TrendingUp } from "lucide-react";

interface EcoStatsProps {
  totalKmShared?: number;
  totalCo2Saved?: number;
  totalMembers?: number;
  variant?: "light" | "dark";
}

const EcoStats = ({
  totalKmShared = 125890,
  totalCo2Saved = 23456,
  totalMembers = 5234,
  variant = "light",
}: EcoStatsProps) => {
  const isLight = variant === "light";
  const text = isLight ? "text-black" : "text-white";
  const sub = isLight ? "text-black/50" : "text-white/50";
  const divider = isLight ? "border-black/15" : "border-white/15";

  const items = [
    { Icon: Leaf, value: `${(totalCo2Saved / 1000).toFixed(1)}T`, label: "CO₂ OFFSET", n: "01" },
    { Icon: TrendingUp, value: `${(totalKmShared / 1000).toFixed(0)}K`, label: "KM SHARED", n: "02" },
    { Icon: Users, value: `${(totalMembers / 1000).toFixed(1)}K`, label: "RIDERS", n: "03" },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 border-t border-b ${divider}`}>
      {items.map(({ Icon, value, label, n }, i) => (
        <div
          key={label}
          className={`flex items-center gap-6 py-10 px-2 ${i > 0 ? `md:border-l ${divider}` : ""}`}
        >
          <Icon className={`h-10 w-10 text-giallo`} strokeWidth={1.5} />
          <div className="flex-1">
            <div className={`font-display text-5xl leading-none ${text}`}>{value}</div>
            <div className={`font-display text-[10px] mt-2 ${sub}`}>{label}</div>
          </div>
          <span className={`font-display text-xs ${sub}`}>{n}</span>
        </div>
      ))}
    </div>
  );
};

export default EcoStats;
