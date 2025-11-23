import { Leaf, Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EcoStatsProps {
  totalKmShared?: number;
  totalCo2Saved?: number;
  totalMembers?: number;
}

const EcoStats = ({ 
  totalKmShared = 125890, 
  totalCo2Saved = 23456, 
  totalMembers = 5234 
}: EcoStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth border-secondary/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary/10">
            <Leaf className="h-8 w-8 text-secondary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">
              {(totalCo2Saved / 1000).toFixed(1)}t
            </p>
            <p className="text-sm text-muted-foreground">CO₂ Saved</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth border-primary/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">
              {(totalKmShared / 1000).toFixed(0)}k
            </p>
            <p className="text-sm text-muted-foreground">KM Shared</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth border-accent/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10">
            <Users className="h-8 w-8 text-accent" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">
              {(totalMembers / 1000).toFixed(1)}k
            </p>
            <p className="text-sm text-muted-foreground">Community</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EcoStats;
