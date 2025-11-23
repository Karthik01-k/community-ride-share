import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Search, PlusCircle, Leaf, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EcoStats from "@/components/EcoStats";
import heroImage from "@/assets/hero-rideshare.jpg";
import ecoIcon from "@/assets/eco-icon.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <img src={ecoIcon} alt="Eco" className="h-5 w-5 rounded" />
                <span className="text-sm font-medium text-secondary">Community-First Ride Sharing</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Share Rides,{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Save Costs,
                </span>{" "}
                Help Earth
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                CRSP connects travelers going the same way. Split fuel costs, reduce emissions, and build community—no profit, just shared journeys.
              </p>

              <div className="flex gap-4">
                <Button asChild size="lg" className="rounded-full text-lg px-8">
                  <Link to="/find-rides">
                    <Search className="mr-2 h-5 w-5" />
                    Find a Ride
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="rounded-full text-lg px-8">
                  <Link to="/post-ride">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Post a Ride
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img 
                src={heroImage} 
                alt="Community Ride Sharing" 
                className="relative rounded-3xl shadow-elevated w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <EcoStats />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Why Choose CRSP?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're different. We're about community, not commerce.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 shadow-card hover:shadow-elevated transition-smooth border-secondary/20 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-secondary/10 mb-6">
                <Leaf className="h-12 w-12 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Eco-Friendly</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reduce your carbon footprint by sharing rides. Every shared journey helps our planet.
              </p>
            </Card>

            <Card className="p-8 shadow-card hover:shadow-elevated transition-smooth border-primary/20 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Cost Sharing Only</h3>
              <p className="text-muted-foreground leading-relaxed">
                Split fuel costs fairly based on distance. No surge pricing, no hidden fees.
              </p>
            </Card>

            <Card className="p-8 shadow-card hover:shadow-elevated transition-smooth border-accent/20 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-accent/10 mb-6">
                <Users className="h-12 w-12 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Build Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with fellow travelers. Build trust through ratings and verified profiles.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of travelers sharing rides across India
            </p>
            <Button asChild size="lg" className="rounded-full text-lg px-12">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
