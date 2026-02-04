"use client";

import { Calendar, MapPin, Users, Wallet } from "lucide-react";
import { z } from "zod";
import { useTamboStreamStatus } from "@tambo-ai/react";

/**
 * Zod schema for TripOverview props
 * Used by Tambo to understand what data the LLM should provide
 */
export const tripOverviewSchema = z.object({
  destination: z.string().describe("City and country name, e.g. 'Tokyo, Japan' or 'Paris, France'"),
  startDate: z.string().describe("Trip start date in readable format like 'March 15, 2026'"),
  endDate: z.string().describe("Trip end date in readable format like 'March 22, 2026'"),
  travelers: z.number().describe("Number of travelers on this trip"),
  totalBudget: z.number().describe("Total trip budget in USD"),
  tripStyle: z.enum(["budget", "moderate", "luxury"]).describe("Overall trip style: budget, moderate, or luxury"),
  highlights: z
    .array(z.string())
    .describe("3-5 trip highlights or themes like 'Street food', 'Temples', 'Nightlife', 'Shopping'"),
});

export type TripOverviewProps = z.infer<typeof tripOverviewSchema>;

/**
 * TripOverview Component
 *
 * Renders a hero card showing the trip summary. Used ONCE at the start
 * when the user asks to plan a trip. Shows destination, dates, budget,
 * and key highlights.
 */
export function TripOverview({
  destination,
  startDate,
  endDate,
  travelers,
  totalBudget,
  highlights,
}: TripOverviewProps) {
  const { streamStatus } = useTamboStreamStatus<TripOverviewProps>();
  const isStreaming = !streamStatus.isSuccess;

  // Defensive defaults
  const safeDestination = destination || "Your Destination";
  const safeStartDate = startDate || "Dates TBD";
  const safeEndDate = endDate || "";
  const safeTravelers = travelers || 1;
  const safeBudget = totalBudget || 0;
  const safeHighlights = highlights?.length ? highlights : ["Adventure awaits"];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white border border-wander-copper/10 shadow-xl shadow-wander-copper/5 animate-fade-in-up ${isStreaming ? 'animate-pulse' : ''}`}>
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-br from-wander-charcoal via-wander-slate to-wander-charcoal" />

      {/* Decorative pattern overlay */}
      <div className="absolute top-0 left-0 right-0 h-36 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="trip-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-wander-copper" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#trip-pattern)" />
        </svg>
      </div>

      <div className="relative p-6">
        {/* Header Section */}
        <div className="mb-6">
          {/* Destination */}
          <h2
            className="text-3xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {safeDestination}
          </h2>

          {/* Date Range */}
          <div className="flex items-center gap-2 text-wander-copper-light mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {safeStartDate}{safeEndDate && ` — ${safeEndDate}`}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Travelers */}
          <div className="bg-wander-warm rounded-xl p-4 border border-wander-copper/10">
            <div className="flex items-center gap-2 text-wander-slate mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Travelers</span>
            </div>
            <p className="text-2xl font-bold text-wander-charcoal" style={{ fontFamily: "var(--font-display)" }}>
              {safeTravelers}
            </p>
          </div>

          {/* Budget */}
          <div className="bg-wander-warm rounded-xl p-4 border border-wander-copper/10">
            <div className="flex items-center gap-2 text-wander-slate mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Budget</span>
            </div>
            <p className="text-2xl font-bold text-wander-charcoal" style={{ fontFamily: "var(--font-display)" }}>
              ${safeBudget.toLocaleString()}
            </p>
          </div>

          {/* Per Person */}
          <div className="bg-wander-warm rounded-xl p-4 border border-wander-copper/10">
            <div className="flex items-center gap-2 text-wander-slate mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Per Person</span>
            </div>
            <p className="text-2xl font-bold text-wander-charcoal" style={{ fontFamily: "var(--font-display)" }}>
              ${safeTravelers > 0 ? Math.round(safeBudget / safeTravelers).toLocaleString() : 0}
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-wander-slate mb-3">
            Trip Highlights
          </h3>
          <div className="flex flex-wrap gap-2">
            {safeHighlights.map((highlight, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-wander-copper/10 text-wander-copper border border-wander-copper/20 transition-all duration-200 hover:bg-wander-copper/20"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
