import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User, Car as CarIcon, IndianRupee } from "lucide-react";
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
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth border-border/50 hover:border-primary/30">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold">{startLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="font-semibold">{endLocation}</span>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full">
            {seatsAvailable} seats
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <CarIcon className="h-4 w-4" />
            <span className="capitalize">{vehicleType}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{driverName}</span>
            </div>
            <span className="text-xs text-muted-foreground">⭐ {driverRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-lg font-bold text-foreground">
              <IndianRupee className="h-4 w-4" />
              {estimatedFuelCost.toFixed(0)}
            </div>
            <Button asChild size="sm" className="rounded-full">
              <Link to={`/trip/${id}`}>View</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TripCard;
