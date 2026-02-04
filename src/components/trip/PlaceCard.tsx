"use client";

import {
  Utensils,
  Landmark,
  TreePine,
  ShoppingBag,
  Moon,
  Building,
  Clock,
  DollarSign,
  Lightbulb,
} from "lucide-react";
import { z } from "zod";
import { useTamboStreamStatus } from "@tambo-ai/react";

/**
 * Zod schema for PlaceCard props
 */
export const placeCardSchema = z.object({
  name: z.string().describe("Name of the place, restaurant, or attraction"),
  description: z.string().describe("2-3 sentence description of why to visit this place"),
  category: z
    .enum(["food", "culture", "nature", "shopping", "nightlife", "accommodation"])
    .describe("Type of place: food, culture, nature, shopping, nightlife, or accommodation"),
  estimatedCost: z
    .number()
    .describe("Estimated cost per person in USD. Use 0 if the place is free to visit"),
  duration: z
    .string()
    .describe("How long to spend here, like '2 hours' or '30 minutes' or 'Half day'"),
  tip: z
    .string()
    .optional()
    .describe("One practical tip like 'Book 2 days ahead' or 'Go before 10am to avoid crowds'"),
});

export type PlaceCardProps = z.infer<typeof placeCardSchema>;

// Category configuration
const CATEGORY_CONFIG = {
  food: {
    icon: Utensils,
    label: "Food & Dining",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    iconColor: "text-orange-500",
  },
  culture: {
    icon: Landmark,
    label: "Culture & History",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    iconColor: "text-purple-500",
  },
  nature: {
    icon: TreePine,
    label: "Nature & Outdoors",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    iconColor: "text-emerald-500",
  },
  shopping: {
    icon: ShoppingBag,
    label: "Shopping",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    iconColor: "text-pink-500",
  },
  nightlife: {
    icon: Moon,
    label: "Nightlife",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    iconColor: "text-indigo-500",
  },
  accommodation: {
    icon: Building,
    label: "Accommodation",
    color: "bg-wander-copper/10 text-wander-copper border-wander-copper/20",
    iconColor: "text-wander-copper",
  },
};

/**
 * PlaceCard Component
 *
 * Renders a card for a specific place, restaurant, attraction, or activity.
 * Use this for individual recommendations. Render MULTIPLE PlaceCards when
 * suggesting several places. Do NOT use this for full day plans.
 */
export function PlaceCard({
  name,
  description,
  category,
  estimatedCost,
  duration,
  tip,
}: PlaceCardProps) {
  const { streamStatus } = useTamboStreamStatus<PlaceCardProps>();
  const isStreaming = !streamStatus.isSuccess;

  // Defensive defaults
  const safeName = name || "Unknown Place";
  const safeDescription = description || "Explore this interesting destination.";
  const safeCategory = category || "culture";
  const safeCost = estimatedCost ?? 0;
  const safeDuration = duration || "Flexible";

  const config = CATEGORY_CONFIG[safeCategory] || CATEGORY_CONFIG.culture;
  const IconComponent = config.icon;

  return (
    <div className={`group rounded-xl bg-white border border-wander-copper/10 shadow-md hover:shadow-lg hover:border-wander-copper/20 transition-all duration-300 overflow-hidden animate-fade-in-up ${isStreaming ? 'animate-pulse' : ''}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Category Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color} transition-transform duration-300 group-hover:scale-110`}>
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide mb-1.5 ${config.color}`}>
              {config.label}
            </span>

            {/* Name */}
            <h3
              className="text-lg font-semibold text-wander-charcoal truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {safeName}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-wander-slate leading-relaxed mb-4">
          {safeDescription}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-4">
          {/* Cost */}
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-wander-copper" />
            <span className="text-sm font-medium text-wander-charcoal">
              {safeCost === 0 ? "Free" : `$${safeCost}`}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-wander-copper" />
            <span className="text-sm font-medium text-wander-charcoal">{safeDuration}</span>
          </div>
        </div>

        {/* Tip (if present) */}
        {tip && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-wander-warm/50 border border-wander-copper/10">
            <Lightbulb className="w-4 h-4 text-wander-copper flex-shrink-0 mt-0.5" />
            <p className="text-xs text-wander-slate italic leading-relaxed">{tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}
