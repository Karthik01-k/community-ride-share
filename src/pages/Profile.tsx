import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Star, Leaf, TrendingUp, Car, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  name: string;
  rating: number;
  total_rides_as_driver: number;
  total_rides_as_passenger: number;
  total_co2_saved_kg: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadProfile();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p className="text-center text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p className="text-center text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="space-y-8">
          <Card className="p-8 shadow-elevated border-border/50">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl bg-primary/10">
                <User className="h-16 w-16 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <Badge variant="secondary" className="rounded-full">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {profile.rating.toFixed(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {profile.total_rides_as_driver}
                    </p>
                    <p className="text-sm text-muted-foreground">Rides as Driver</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {profile.total_rides_as_passenger}
                    </p>
                    <p className="text-sm text-muted-foreground">Rides as Passenger</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">
                      {(profile.total_co2_saved_kg / 1000).toFixed(1)}t
                    </p>
                    <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {profile.total_rides_as_driver + profile.total_rides_as_passenger}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Trips</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-card border-secondary/20">
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold">Eco Impact</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Your contribution to reducing carbon emissions through shared rides
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trees Equivalent</span>
                  <span className="font-semibold">~{Math.floor(profile.total_co2_saved_kg / 20)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fuel Saved (est.)</span>
                  <span className="font-semibold">~{Math.floor(profile.total_co2_saved_kg / 2.3)}L</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-card border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-bold">Community Standing</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Your trust and reliability in the CRSP community
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trust Level</span>
                  <Badge variant="secondary">
                    {profile.rating >= 4 ? "Excellent" : profile.rating >= 3 ? "Good" : "Building"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="font-semibold">2024</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 shadow-card">
            <Tabs defaultValue="driver" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="driver" className="flex-1">As Driver</TabsTrigger>
                <TabsTrigger value="passenger" className="flex-1">As Passenger</TabsTrigger>
              </TabsList>

              <TabsContent value="driver">
                <div className="text-center py-12">
                  <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Your posted rides will appear here</p>
                  <Button asChild className="mt-4 rounded-full" variant="secondary">
                    <a href="/post-ride">Post a Ride</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="passenger">
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Your booked rides will appear here</p>
                  <Button asChild className="mt-4 rounded-full">
                    <a href="/find-rides">Find Rides</a>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
