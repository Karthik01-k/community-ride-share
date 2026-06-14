import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated caller to prevent abuse of the Google Maps quota
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { origin, destination } = await req.json();

    // Basic input validation
    const isCoord = (c: unknown): c is { lat: number; lng: number } =>
      !!c && typeof c === "object" &&
      typeof (c as any).lat === "number" && typeof (c as any).lng === "number" &&
      Math.abs((c as any).lat) <= 90 && Math.abs((c as any).lng) <= 180;

    if (!isCoord(origin) || !isCoord(destination)) {
      return new Response(JSON.stringify({ error: "Invalid origin or destination" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const directionsUrl = new URL("https://maps.googleapis.com/maps/api/directions/json");
    directionsUrl.searchParams.append("origin", `${origin.lat},${origin.lng}`);
    directionsUrl.searchParams.append("destination", `${destination.lat},${destination.lng}`);
    directionsUrl.searchParams.append("key", GOOGLE_MAPS_API_KEY!);

    const response = await fetch(directionsUrl.toString());
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Directions API error:", data.status);
      return new Response(JSON.stringify({ error: "Could not calculate route" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    const result = {
      distance_km: leg.distance.value / 1000,
      duration_minutes: leg.duration.value / 60,
      polyline: route.overview_polyline.points,
      start_address: leg.start_address,
      end_address: leg.end_address,
      start_location: leg.start_location,
      end_location: leg.end_location,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calculating route:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
