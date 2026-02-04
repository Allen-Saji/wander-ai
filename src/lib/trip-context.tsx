"use client";

import { useEffect, useCallback } from "react";
import { useTambo, useTamboContextHelpers } from "@tambo-ai/react";

/**
 * Shape of trip state extracted from TripOverview component
 */
export interface TripState {
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  travelers: number | null;
  totalBudget: number | null;
  tripStyle: string | null;
  daysCount: number | null;
}

/**
 * Extract trip state from thread messages by finding TripOverview components
 */
function extractTripState(messages: Array<{ component?: { componentName?: string | null }; componentState?: Record<string, unknown> }>): TripState | null {
  // Find the most recent TripOverview message
  const tripOverviewMessage = [...messages]
    .reverse()
    .find((msg) => msg.component?.componentName === "TripOverview");

  if (!tripOverviewMessage?.componentState) {
    return null;
  }

  const state = tripOverviewMessage.componentState;

  // Calculate days count from dates if available
  let daysCount: number | null = null;
  if (state.startDate && state.endDate) {
    try {
      const start = new Date(state.startDate as string);
      const end = new Date(state.endDate as string);
      daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      // Ignore date parsing errors
    }
  }

  return {
    destination: (state.destination as string) || null,
    startDate: (state.startDate as string) || null,
    endDate: (state.endDate as string) || null,
    travelers: (state.travelers as number) || null,
    totalBudget: (state.totalBudget as number) || null,
    tripStyle: (state.tripStyle as string) || null,
    daysCount,
  };
}

/**
 * Component that syncs trip state from thread messages to Tambo context helpers.
 * Must be rendered inside TamboProvider.
 *
 * This enables the AI to always know the current trip context without
 * having to re-parse the conversation history.
 */
export function TripContextSync() {
  const { thread } = useTambo();
  const { addContextHelper, removeContextHelper } = useTamboContextHelpers();

  // Create a stable helper function that returns current trip state
  const getTripContext = useCallback(() => {
    if (!thread?.messages?.length) {
      return null; // Return null to skip context when no trip exists
    }

    const tripState = extractTripState(thread.messages);

    if (!tripState?.destination) {
      return null; // No trip planned yet
    }

    return {
      currentTrip: {
        destination: tripState.destination,
        dates: tripState.startDate && tripState.endDate
          ? `${tripState.startDate} to ${tripState.endDate}`
          : "Dates not set",
        days: tripState.daysCount || "Unknown",
        travelers: tripState.travelers || 1,
        budget: tripState.totalBudget ? `$${tripState.totalBudget}` : "Not set",
        style: tripState.tripStyle || "moderate",
      },
      instructions: "Use this context to maintain consistency. Don't suggest activities outside the destination. Keep budget recommendations aligned with the total budget and trip style.",
    };
  }, [thread?.messages]);

  // Register the context helper on mount and when thread changes
  useEffect(() => {
    addContextHelper("tripContext", getTripContext);

    return () => {
      removeContextHelper("tripContext");
    };
  }, [addContextHelper, removeContextHelper, getTripContext]);

  // This component doesn't render anything
  return null;
}
