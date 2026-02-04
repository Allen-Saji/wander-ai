/**
 * Travel Time Service
 *
 * Estimates travel time between two locations using:
 * - Nominatim (OpenStreetMap) for geocoding location names
 * - Haversine formula for distance calculation
 * - Rough speed estimates by transport mode
 *
 * No API key required.
 */

import { z } from "zod";

/**
 * Input schema for getTravelTime tool
 */
export const getTravelTimeInputSchema = z.object({
  origin: z
    .string()
    .describe("Starting location like 'Senso-ji Temple, Tokyo' or 'Eiffel Tower, Paris'"),
  destination: z
    .string()
    .describe("Ending location like 'Shibuya Crossing, Tokyo' or 'Louvre Museum, Paris'"),
  mode: z
    .enum(["walking", "transit", "driving", "cycling"])
    .describe("Mode of transport: walking, transit, driving, or cycling"),
});

/**
 * Output schema for getTravelTime tool
 */
export const getTravelTimeOutputSchema = z.object({
  origin: z.string().describe("Full origin location name from geocoding"),
  destination: z.string().describe("Full destination location name from geocoding"),
  distanceKm: z.number().describe("Distance in kilometers"),
  estimatedMinutes: z.number().describe("Estimated travel time in minutes"),
  mode: z.string().describe("Mode of transport used"),
  error: z.string().optional().describe("Error message if something went wrong"),
});

export type GetTravelTimeInput = z.infer<typeof getTravelTimeInputSchema>;
export type GetTravelTimeOutput = z.infer<typeof getTravelTimeOutputSchema>;

/**
 * Average speeds by transport mode (km/h) for urban travel
 */
const SPEEDS: Record<string, number> = {
  walking: 5,
  transit: 25,
  driving: 35,
  cycling: 15,
};

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Geocode a location name to lat/lon
 */
async function geocode(
  location: string
): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "WanderAI/1.0 (trip-planner-app)",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      name: data[0].display_name,
    };
  } catch {
    return null;
  }
}

/**
 * Estimate travel time between two locations
 *
 * @param params - Origin, destination, and transport mode
 * @returns Distance and estimated travel time
 */
export async function getTravelTime({
  origin,
  destination,
  mode,
}: GetTravelTimeInput): Promise<GetTravelTimeOutput> {
  try {
    // Geocode both locations in parallel
    const [originGeo, destGeo] = await Promise.all([
      geocode(origin),
      geocode(destination),
    ]);

    if (!originGeo) {
      return {
        origin,
        destination,
        distanceKm: 0,
        estimatedMinutes: 0,
        mode,
        error: `Could not find location: "${origin}"`,
      };
    }

    if (!destGeo) {
      return {
        origin: originGeo.name,
        destination,
        distanceKm: 0,
        estimatedMinutes: 0,
        mode,
        error: `Could not find location: "${destination}"`,
      };
    }

    // Calculate straight-line distance
    const distance = haversineDistance(
      originGeo.lat,
      originGeo.lon,
      destGeo.lat,
      destGeo.lon
    );

    // Estimate time with 1.3x multiplier for non-straight routes
    const speed = SPEEDS[mode] || SPEEDS.transit;
    const timeMinutes = Math.round((distance / speed) * 60 * 1.3);

    return {
      origin: originGeo.name,
      destination: destGeo.name,
      distanceKm: Math.round(distance * 10) / 10,
      estimatedMinutes: Math.max(1, timeMinutes), // At least 1 minute
      mode,
    };
  } catch (error) {
    return {
      origin,
      destination,
      distanceKm: 0,
      estimatedMinutes: 0,
      mode,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
