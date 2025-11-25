# Google Maps Integration Setup

## Getting Your Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable these APIs:
     - **Maps JavaScript API**
     - **Places API**
     - **Directions API**
     - **Geocoding API**

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Configure API Key (Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions":
     - For development: Choose "None"
     - For production: Choose "HTTP referrers" and add your domain
   - Under "API restrictions":
     - Choose "Restrict key"
     - Select the 4 APIs listed above

6. **Add API Key to Your Project**
   
   **For Local Development:**
   - Create a `.env.local` file in your project root
   - Add: `VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`
   
   **For Lovable Cloud (Already Done):**
   - The key is already securely stored in Supabase Secrets
   - Used by the `calculate-route` edge function

## Features Enabled

✅ **Location Autocomplete** - Google Places API for address suggestions
✅ **Current Location Detection** - Geocoding API for reverse geocoding  
✅ **Route Visualization** - Maps JavaScript API for displaying routes
✅ **Distance Calculation** - Directions API for accurate route data
✅ **Automatic Fuel Cost Estimation** - Based on calculated distance (₹8/km base rate)

## Cost Considerations

Google Maps offers **$200 free monthly credit** which covers:
- ~28,000 map loads
- ~40,000 geocoding requests
- ~40,000 directions requests

For a community ride-sharing platform, this should be sufficient for initial growth.

## Testing

After adding your API key:
1. Go to "Post Ride" page
2. Click the location button to test current location detection
3. Start typing an address to see autocomplete suggestions
4. Complete the form to see route visualization and distance calculation

## Troubleshooting

- **"This page can't load Google Maps correctly"**: Check if APIs are enabled
- **No autocomplete suggestions**: Verify Places API is enabled
- **Route not showing**: Check Directions API and Maps JavaScript API
- **Current location not working**: Enable browser location permissions
