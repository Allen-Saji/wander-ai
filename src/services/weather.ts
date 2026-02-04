/**
 * Weather Service
 *
 * Gets 7-day weather forecast for a city using:
 * - Nominatim (OpenStreetMap) for geocoding city name → lat/lon
 * - Open-Meteo for weather forecast data
 *
 * Both APIs are free and don't require API keys.
 */

import { z } from "zod";

// Weather code descriptions (WMO codes)
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Input schema for getWeather tool
 */
export const getWeatherInputSchema = z.object({
  city: z
    .string()
    .describe("City name to get weather for, like 'Tokyo' or 'Paris, France'"),
});

/**
 * Output schema for getWeather tool
 */
export const getWeatherOutputSchema = z.object({
  city: z.string().describe("Full city name from geocoding"),
  forecast: z.array(
    z.object({
      date: z.string().describe("Date in YYYY-MM-DD format"),
      high: z.number().describe("High temperature in Celsius"),
      low: z.number().describe("Low temperature in Celsius"),
      code: z.number().describe("WMO weather code"),
      description: z.string().describe("Human-readable weather description"),
    })
  ),
  error: z.string().optional().describe("Error message if something went wrong"),
});

export type GetWeatherInput = z.infer<typeof getWeatherInputSchema>;
export type GetWeatherOutput = z.infer<typeof getWeatherOutputSchema>;

/**
 * Get 7-day weather forecast for a city
 *
 * @param params - Object containing city name
 * @returns Weather forecast with daily high/low temps and conditions
 */
export async function getWeather({ city }: GetWeatherInput): Promise<GetWeatherOutput> {
  try {
    // Step 1: Geocode city name to lat/lon via Nominatim
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "WanderAI/1.0 (trip-planner-app)",
        },
      }
    );

    if (!geoResponse.ok) {
      return {
        city,
        forecast: [],
        error: "Failed to geocode city",
      };
    }

    const geoData = await geoResponse.json();

    if (!geoData.length) {
      return {
        city,
        forecast: [],
        error: `City "${city}" not found`,
      };
    }

    const { lat, lon, display_name } = geoData[0];

    // Step 2: Fetch forecast from Open-Meteo
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`
    );

    if (!weatherResponse.ok) {
      return {
        city: display_name,
        forecast: [],
        error: "Failed to fetch weather data",
      };
    }

    const weatherData = await weatherResponse.json();

    // Step 3: Format the forecast
    const forecast = weatherData.daily.time.map((date: string, i: number) => ({
      date,
      high: Math.round(weatherData.daily.temperature_2m_max[i]),
      low: Math.round(weatherData.daily.temperature_2m_min[i]),
      code: weatherData.daily.weathercode[i],
      description: WEATHER_CODES[weatherData.daily.weathercode[i]] || "Unknown",
    }));

    return {
      city: display_name,
      forecast,
    };
  } catch (error) {
    return {
      city,
      forecast: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
