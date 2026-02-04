/**
 * @file tambo.ts
 * @description Central configuration for WanderAI Tambo components and tools
 *
 * Components:
 * - TripOverview (generative) - Hero card for trip summary
 * - BudgetBreakdown (generative) - Donut chart for budget categories
 * - PlaceCard (generative) - Individual place/restaurant cards
 * - DayItinerary (interactable) - Daily timeline, updates in place
 * - BudgetTracker (interactable) - Expense tracking, updates in place
 *
 * Tools:
 * - getWeather - 7-day forecast via Open-Meteo
 * - getTravelTime - Distance/time estimates between locations
 */

import type { TamboComponent, TamboTool } from "@tambo-ai/react";
import {
  TripOverview,
  tripOverviewSchema,
  BudgetBreakdown,
  budgetBreakdownSchema,
  BudgetTracker,
  budgetTrackerSchema,
  PlaceCard,
  placeCardSchema,
  DayItinerary,
  dayItinerarySchema,
  WeatherForecast,
  weatherForecastSchema,
} from "@/components/trip";
import {
  getWeather,
  getWeatherInputSchema,
  getWeatherOutputSchema,
} from "@/services/weather";
import {
  getTravelTime,
  getTravelTimeInputSchema,
  getTravelTimeOutputSchema,
} from "@/services/travel-time";

/**
 * Tambo Tools
 *
 * Tools that the AI can call to fetch real-time data.
 */
export const tools: TamboTool[] = [
  {
    name: "getWeather",
    description:
      "Gets the 7-day weather forecast for a city. Call this when the user asks about weather, what to pack, what to wear, or best time to visit. Returns daily high/low temperatures and conditions. Use the forecast data in your text response or to inform activity suggestions.",
    tool: getWeather,
    inputSchema: getWeatherInputSchema,
    outputSchema: getWeatherOutputSchema,
  },
  {
    name: "getTravelTime",
    description:
      "Estimates travel time and distance between two locations. Call this when building itineraries to make schedules realistic, or when the user asks how far apart places are. Supports walking, transit, driving, and cycling modes. Use this data to space out activities properly in DayItinerary.",
    tool: getTravelTime,
    inputSchema: getTravelTimeInputSchema,
    outputSchema: getTravelTimeOutputSchema,
  },
];

/**
 * Tambo Components
 *
 * AI-controlled components that render in the Trip Panel.
 * Each component has a precise description to guide the LLM.
 */
export const components: TamboComponent[] = [
  {
    name: "TripOverview",
    description:
      "Renders a trip overview hero card. Use this ONCE at the start when the user asks to plan a trip. Shows destination, dates, budget, travelers, and key highlights. Do NOT use this for individual places or daily plans - use PlaceCard or DayItinerary instead.",
    component: TripOverview,
    propsSchema: tripOverviewSchema,
  },
  {
    name: "BudgetBreakdown",
    description:
      "Renders a budget breakdown donut chart showing how the trip budget is split across categories (Accommodation, Food, Transport, Activities, Miscellaneous). Use when the user asks about budget, costs, spending, or money. Always include at least 4 categories.",
    component: BudgetBreakdown,
    propsSchema: budgetBreakdownSchema,
  },
  {
    name: "PlaceCard",
    description:
      "Renders a card for a specific place, restaurant, attraction, or activity. Use this for individual recommendations. Render MULTIPLE PlaceCards when suggesting several places (e.g., 'recommend restaurants' should render 3-5 PlaceCards). Do NOT use this for full day plans - use DayItinerary instead.",
    component: PlaceCard,
    propsSchema: placeCardSchema,
  },
  {
    name: "DayItinerary",
    description:
      "Renders a single day's itinerary as a timeline with activities. Use one DayItinerary per day when planning multi-day trips. For a 3-day trip, render 3 separate DayItinerary components with IDs 'day-1', 'day-2', 'day-3'. Each activity should have a time, name, description, type (food/culture/nature/shopping/nightlife/transport/rest), cost, and duration. When the user asks to modify a specific day (e.g., 'add a restaurant to day 2'), update that existing DayItinerary rather than creating a new one.",
    component: DayItinerary,
    propsSchema: dayItinerarySchema,
  },
  {
    name: "BudgetTracker",
    description:
      "Tracks trip expenses against a budget with a list of expense items. Use this when the user wants to track spending, add expenses, or monitor their budget throughout the trip. Render ONE BudgetTracker per trip with ID 'budget-tracker'. When the user asks to add an expense (e.g., 'add $50 for dinner', 'I spent $200 on the hotel'), update the existing BudgetTracker's expenses array rather than creating a new one. Categories: accommodation, food, transport, activities, shopping, other. Mark expenses as isPaid: true when confirmed paid.",
    component: BudgetTracker,
    propsSchema: budgetTrackerSchema,
  },
  {
    name: "WeatherForecast",
    description:
      "Renders a visual weather forecast card showing 5-7 days of weather. Use this when the user asks about weather, what to pack, what to wear, or climate conditions for their trip. First call the getWeather tool to fetch real data, then render this component with the forecast. Map weather codes to conditions: clear/sunny → 'sunny', partly cloudy → 'partly-cloudy', overcast → 'cloudy', rain/drizzle/showers → 'rainy', thunderstorm → 'stormy', snow → 'snowy', fog → 'foggy'.",
    component: WeatherForecast,
    propsSchema: weatherForecastSchema,
  },
];
