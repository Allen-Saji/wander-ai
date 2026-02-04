"use client";

import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Thermometer,
} from "lucide-react";
import { z } from "zod";

/**
 * Zod schema for WeatherForecast props
 */
export const weatherForecastSchema = z.object({
  city: z.string().describe("City name for the forecast"),
  forecast: z
    .array(
      z.object({
        date: z.string().describe("Date in YYYY-MM-DD format or readable format"),
        high: z.number().describe("High temperature in Celsius"),
        low: z.number().describe("Low temperature in Celsius"),
        condition: z
          .enum(["sunny", "partly-cloudy", "cloudy", "rainy", "stormy", "snowy", "foggy"])
          .describe("Weather condition: sunny, partly-cloudy, cloudy, rainy, stormy, snowy, or foggy"),
        description: z.string().optional().describe("Optional weather description"),
      })
    )
    .describe("Array of daily forecasts, typically 5-7 days"),
});

export type WeatherForecastProps = z.infer<typeof weatherForecastSchema>;

// Weather condition configuration
const WEATHER_CONFIG = {
  sunny: {
    icon: Sun,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Sunny",
  },
  "partly-cloudy": {
    icon: Cloud,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    label: "Partly Cloudy",
  },
  cloudy: {
    icon: Cloud,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    label: "Cloudy",
  },
  rainy: {
    icon: CloudRain,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Rainy",
  },
  stormy: {
    icon: CloudLightning,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    label: "Stormy",
  },
  snowy: {
    icon: CloudSnow,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    label: "Snowy",
  },
  foggy: {
    icon: CloudFog,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    label: "Foggy",
  },
};

/**
 * Format date string to short format
 */
function formatDate(dateStr: string): { day: string; date: string } {
  try {
    const date = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
      day: days[date.getDay()],
      date: `${months[date.getMonth()]} ${date.getDate()}`,
    };
  } catch {
    return { day: "---", date: dateStr };
  }
}

/**
 * WeatherForecast Component
 *
 * Displays a weather forecast for a city. Use this when the user asks about
 * weather, what to pack, or what to wear. Shows daily high/low temperatures
 * and conditions for the next 5-7 days.
 */
export function WeatherForecast({ city, forecast }: WeatherForecastProps) {
  // Defensive defaults
  const safeCity = city || "Unknown Location";
  const safeForecast = forecast?.length ? forecast : [];

  if (safeForecast.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-wander-copper/10 shadow-lg p-6 animate-fade-in-up">
        <div className="text-center py-8">
          <Cloud className="w-12 h-12 mx-auto text-wander-copper/30 mb-3" />
          <p className="text-wander-slate text-sm">No weather data available</p>
        </div>
      </div>
    );
  }

  // Calculate average temps for summary
  const avgHigh = Math.round(safeForecast.reduce((sum, d) => sum + (d.high ?? 0), 0) / safeForecast.length);
  const avgLow = Math.round(safeForecast.reduce((sum, d) => sum + (d.low ?? 0), 0) / safeForecast.length);

  return (
    <div className="rounded-2xl bg-white border border-wander-copper/10 shadow-lg overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Weather Forecast
            </h3>
            <p className="text-sky-100 text-sm">{safeCity}</p>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Thermometer className="w-5 h-5" />
            <span className="text-sm font-medium">
              {avgLow}° - {avgHigh}°C avg
            </span>
          </div>
        </div>
      </div>

      {/* Forecast Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {safeForecast.slice(0, 7).map((day, index) => {
            const condition = day.condition || "partly-cloudy";
            const config = WEATHER_CONFIG[condition] || WEATHER_CONFIG["partly-cloudy"];
            const IconComponent = config.icon;
            const { day: dayName, date } = formatDate(day.date);
            const high = day.high ?? 0;
            const low = day.low ?? 0;

            return (
              <div
                key={index}
                className={`flex flex-col items-center p-3 rounded-xl ${config.bgColor} transition-transform duration-200 hover:scale-105`}
              >
                {/* Day */}
                <span className="text-xs font-semibold text-wander-charcoal mb-1">
                  {dayName}
                </span>
                <span className="text-[10px] text-wander-slate mb-2">{date}</span>

                {/* Icon */}
                <IconComponent className={`w-8 h-8 ${config.color} mb-2`} />

                {/* Temps */}
                <div className="text-center">
                  <span className="text-sm font-bold text-wander-charcoal">{high}°</span>
                  <span className="text-xs text-wander-slate mx-1">/</span>
                  <span className="text-xs text-wander-slate">{low}°</span>
                </div>

                {/* Condition label */}
                <span className="text-[9px] text-wander-slate mt-1 text-center leading-tight">
                  {day.description || config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer tip */}
      <div className="px-6 py-3 bg-wander-warm/30 border-t border-wander-copper/10">
        <p className="text-xs text-wander-slate text-center">
          Pack layers for temperatures between {Math.min(...safeForecast.map(d => d.low ?? 0))}°C and {Math.max(...safeForecast.map(d => d.high ?? 0))}°C
        </p>
      </div>
    </div>
  );
}
