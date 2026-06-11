import { ArrowRight, Calendar, Car as CarIcon, IndianRupee, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface TripCardProps {
  id: string;
  startLocation: string;
  endLocation: string;
  departureTime: string;
  seatsAvailable: number;
  estimatedFuelCost: number;
  driverName: string;
  driverRating: number;
  vehicleType: string;
}

const TripCard = ({
  id,
  startLocation,
  endLocation,
  departureTime,
  seatsAvailable,
  estimatedFuelCost,
  driverName,
  driverRating,
  vehicleType,
}: TripCardProps) => {
  const formattedDate = new Date(departureTime).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      to={`/trip/${id}`}
      className="group block lambo-card hover:border-giallo transition-colors"
    >
      <div className="grid md:grid-cols-[1fr_auto] gap-0">
        <div className="p-6 md:p-8 border-r border-border">
          {/* Route line */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex flex-col items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-giallo" />
              <span className="h-10 w-px bg-border" />
              <span className="h-2.5 w-2.5 rounded-full border border-white" />
            </div>
            <div className="flex-1 space-y-7">
              <div>
                <p className="font-display text-[10px] text-muted-foreground">FROM</p>
                <p className="font-display text-lg text-foreground leading-none mt-1">{startLocation}</p>
              </div>
              <div>
                <p className="font-display text-[10px] text-muted-foreground">TO</p>
                <p className="font-display text-lg text-foreground leading-none mt-1">{endLocation}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-border">
            <span className="flex items-center gap-2 font-display text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> {formattedDate.toUpperCase()}
            </span>
            <span className="flex items-center gap-2 font-display text-xs text-muted-foreground">
              <CarIcon className="h-3.5 w-3.5" /> {vehicleType.toUpperCase()}
            </span>
            <span className="flex items-center gap-2 font-display text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {driverName.toUpperCase()}
            </span>
            <span className="flex items-center gap-1 font-display text-xs text-giallo">
              <Star className="h-3.5 w-3.5 fill-current" /> {driverRating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 p-6 md:p-8 bg-[hsl(0_0%_8%)] md:min-w-[180px]">
          <div className="text-center">
            <p className="font-display text-[10px] text-muted-foreground">EST. FUEL</p>
            <p className="font-display text-3xl text-white leading-none mt-1 flex items-center justify-center">
              <IndianRupee className="h-5 w-5" />{estimatedFuelCost.toFixed(0)}
            </p>
            <p className="font-display text-[10px] text-giallo mt-2">{seatsAvailable} SEATS LEFT</p>
          </div>
          <span className="btn-giallo w-full md:w-auto group-hover:bg-[hsl(var(--giallo-ombra))] group-hover:text-white">
            VIEW <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
