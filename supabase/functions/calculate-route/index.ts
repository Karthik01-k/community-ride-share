import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination } = await req.json();
    
    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    console.log('Calculating route from', origin, 'to', destination);

    // Call Google Directions API
    const directionsUrl = new URL('https://maps.googleapis.com/maps/api/directions/json');
    directionsUrl.searchParams.append('origin', `${origin.lat},${origin.lng}`);
    directionsUrl.searchParams.append('destination', `${destination.lat},${destination.lng}`);
    directionsUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY!);

    const response = await fetch(directionsUrl.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Directions API error:', data);
      throw new Error(`Directions API error: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];
    
    const result = {
      distance_km: leg.distance.value / 1000, // Convert meters to km
      duration_minutes: leg.duration.value / 60, // Convert seconds to minutes
      polyline: route.overview_polyline.points,
      start_address: leg.start_address,
      end_address: leg.end_address,
      start_location: leg.start_location,
      end_location: leg.end_location,
    };

    console.log('Route calculated:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error calculating route:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
