"use client";

import { withInteractable, useTamboStreamStatus } from "@tambo-ai/react";
import {
  Utensils,
  Landmark,
  TreePine,
  ShoppingBag,
  Moon,
  Bus,
  Coffee,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import { z } from "zod";

/**
 * Activity type configuration
 */
const ACTIVITY_CONFIG = {
  food: {
    icon: Utensils,
    color: "bg-orange-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600",
  },
  culture: {
    icon: Landmark,
    color: "bg-purple-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
  },
  nature: {
    icon: TreePine,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
  },
  shopping: {
    icon: ShoppingBag,
    color: "bg-pink-500",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-600",
  },
  nightlife: {
    icon: Moon,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-600",
  },
  transport: {
    icon: Bus,
    color: "bg-slate-500",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-600",
  },
  rest: {
    icon: Coffee,
    color: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
  },
};

/**
 * Zod schema for a single activity
 */
const activitySchema = z.object({
  time: z.string().describe("Time slot like '9:00 AM' or 'Morning' or '14:00'"),
  name: z.string().describe("Activity or place name"),
  description: z.string().describe("One sentence about what to do here"),
  type: z
    .enum(["food", "culture", "nature", "shopping", "nightlife", "transport", "rest"])
    .describe("Activity type: food, culture, nature, shopping, nightlife, transport, or rest"),
  cost: z.number().describe("Estimated cost per person in USD. Use 0 if free"),
  duration: z.string().describe("How long this activity takes, like '1.5 hours' or '30 min'"),
});

/**
 * Zod schema for DayItinerary props
 */
export const dayItinerarySchema = z.object({
  dayNumber: z.number().describe("Day number in the trip, starting from 1"),
  date: z.string().describe("Date for this day in readable format like 'March 15, 2026'"),
  title: z
    .string()
    .describe("Short theme for the day like 'Temple Run & Street Food' or 'Relaxed Beach Day'"),
  activities: z
    .array(activitySchema)
    .describe("List of activities for this day in chronological order. Include 4-8 activities."),
  dayBudget: z.number().describe("Total estimated cost for this day in USD"),
});

export type DayItineraryProps = z.infer<typeof dayItinerarySchema>;
type Activity = z.infer<typeof activitySchema>;

/**
 * Single Activity Card in the timeline
 */
function ActivityCard({ activity, isLast }: { activity: Activity; isLast: boolean }) {
  const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.culture;
  const IconComponent = config.icon;

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[19px] top-12 w-0.5 h-[calc(100%-48px)] bg-gradient-to-b from-wander-copper/30 to-wander-copper/10" />
      )}

      {/* Time badge */}
      <div className="flex-shrink-0 w-10 pt-1">
        <span className="text-xs font-medium text-wander-slate">{activity.time || "TBD"}</span>
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center border border-white shadow-sm z-10`}>
        <IconComponent className={`w-5 h-5 ${config.textColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-wander-copper/10 p-4 shadow-sm hover:shadow-md hover:border-wander-copper/20 transition-all duration-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-semibold text-wander-charcoal text-sm leading-tight">
              {activity.name || "Activity"}
            </h4>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${config.bgColor} ${config.textColor}`}>
              {activity.type}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-wander-slate leading-relaxed mb-3">
            {activity.description || "Enjoy this activity."}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-wander-slate">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{activity.duration || "Flexible"}</span>
            </div>
            <div className="flex items-center gap-1 text-wander-slate">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {activity.cost === 0 ? "Free" : `$${activity.cost}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DayItinerary Base Component
 *
 * Renders a single day's itinerary as a timeline. Use one DayItinerary per day
 * when planning multi-day trips. Each DayItinerary has a unique ID like 'day-1'.
 * When the user asks to modify a specific day, update that day's DayItinerary
 * by its ID rather than creating a new one.
 */
function DayItineraryBase({
  dayNumber,
  date,
  title,
  activities,
  dayBudget,
}: DayItineraryProps) {
  const { streamStatus } = useTamboStreamStatus<DayItineraryProps>();
  const isStreaming = !streamStatus.isSuccess;

  // Defensive defaults
  const safeDayNumber = dayNumber || 1;
  const safeDate = date || "Date TBD";
  const safeTitle = title || `Day ${safeDayNumber}`;
  const safeActivities = activities?.length ? activities : [];
  const safeBudget = dayBudget || 0;

  // Calculate actual total from activities
  const calculatedBudget = safeActivities.reduce((sum, act) => sum + (act.cost || 0), 0);
  const displayBudget = safeBudget || calculatedBudget;

  return (
    <div className="rounded-2xl bg-wander-warm/30 border border-wander-copper/10 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-wander-charcoal to-wander-slate px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Day Badge */}
            <div className="w-12 h-12 rounded-xl bg-wander-copper/20 flex flex-col items-center justify-center border border-wander-copper/30">
              <span className="text-[10px] uppercase tracking-wide text-wander-copper-light font-medium">Day</span>
              <span className="text-xl font-bold text-white -mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
                {safeDayNumber}
              </span>
            </div>

            <div>
              <h3
                className="text-lg font-semibold text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {safeTitle}
              </h3>
              <div className="flex items-center gap-1.5 text-wander-copper-light mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{safeDate}</span>
              </div>
            </div>
          </div>

          {/* Day Budget */}
          <div className="text-right flex items-center gap-3">
            {isStreaming && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-wander-copper/20">
                <Loader2 className="w-3 h-3 text-wander-copper-light animate-spin" />
                <span className="text-[10px] text-wander-copper-light">Loading...</span>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase tracking-wide text-wander-slate font-medium">Est. Cost</span>
              <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                ${displayBudget}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="p-5">
        {safeActivities.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-10 h-10 mx-auto text-wander-copper/30 mb-3" />
            <p className="text-sm text-wander-slate">No activities planned yet</p>
            <p className="text-xs text-wander-slate/60 mt-1">Ask me to add some activities to this day</p>
          </div>
        ) : (
          <div className="space-y-0">
            {safeActivities.map((activity, index) => (
              <ActivityCard
                key={`${activity.time}-${activity.name}-${index}`}
                activity={activity}
                isLast={index === safeActivities.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {safeActivities.length > 0 && (
        <div className="px-5 py-3 bg-white/50 border-t border-wander-copper/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-wander-slate">
              {safeActivities.length} {safeActivities.length === 1 ? "activity" : "activities"} planned
            </span>
            <span className="font-medium text-wander-copper">
              Total: ${displayBudget}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Interactable DayItinerary Component
 *
 * Wrapped with withInteractable to allow the AI to update this component
 * in place when the user requests changes to a specific day.
 */
export const DayItinerary = withInteractable(DayItineraryBase, {
  componentName: "DayItinerary",
  description:
    "Renders a single day's itinerary as a timeline. Use one DayItinerary per day when planning multi-day trips. Each DayItinerary should have a unique ID like 'day-1', 'day-2', etc. When the user asks to modify a specific day (e.g., 'make day 2 more relaxed'), update that day's DayItinerary by referencing its ID rather than creating a new one.",
  propsSchema: dayItinerarySchema,
});
