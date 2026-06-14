import { useLocation, useNavigate } from "react-router-dom";
import logoAsset from "@/assets/ridebuddy-logo.png.asset.json";

interface BrandLogoProps {
  size?: "sm" | "md";
  className?: string;
  showWordmark?: boolean;
}

export function BrandLogo({ size = "md", className = "", showWordmark = false }: BrandLogoProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const el = document.getElementById("hero");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    navigate("/#hero");
  };

  const h = size === "sm" ? "h-8" : "h-10";

  return (
    <a
      href="/#hero"
      onClick={handleClick}
      aria-label="RideBuddy — go to hero"
      className={`inline-flex items-center gap-2 shrink-0 rounded-xl hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] ${className}`}
    >
      <img
        src={logoAsset.url}
        alt="RideBuddy"
        className={`${h} w-auto object-contain`}
        draggable={false}
      />
      {showWordmark && (
        <span className="font-display text-base text-foreground leading-none hidden sm:inline">
          RideBuddy
        </span>
      )}
    </a>
  );
}
