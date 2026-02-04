"use client";

import { useTambo } from "@tambo-ai/react";
import { Map, Sparkles, AlertCircle } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <div className="max-w-md text-center">
        {/* Decorative Element */}
        <div className="relative mb-8 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-wander-warm to-wander-cream border border-wander-copper/10 flex items-center justify-center shadow-xl shadow-wander-copper/5">
            <Map className="w-9 h-9 text-wander-copper" strokeWidth={1.5} />
          </div>
          {/* Floating sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-wander-copper-light animate-float" style={{ animationDelay: "0ms" }} />
          <Sparkles className="absolute -bottom-1 -left-3 w-4 h-4 text-wander-copper/60 animate-float" style={{ animationDelay: "500ms" }} />
        </div>

        {/* Text Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h2
            className="text-2xl font-semibold text-wander-charcoal mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Journey Awaits
          </h2>
          <p className="text-wander-slate text-sm leading-relaxed max-w-sm mx-auto">
            Start a conversation to see your personalized trip plan appear here — complete with daily itineraries, budget breakdowns, and curated recommendations.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          {["Itineraries", "Budgets", "Places", "Weather"].map((feature, i) => (
            <span
              key={feature}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-wander-copper/10 text-wander-copper border border-wander-copper/20"
              style={{ animationDelay: `${350 + i * 50}ms` }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComponentErrorFallback() {
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Failed to render component</span>
      </div>
    </div>
  );
}

function TripComponents() {
  const { thread } = useTambo();

  // Extract rendered components from messages
  const renderedComponents = thread?.messages
    ?.filter((msg) => msg.role === "assistant" && msg.renderedComponent)
    .map((msg) => ({
      id: msg.id,
      component: msg.renderedComponent,
    })) || [];

  if (renderedComponents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="p-6 space-y-6 trip-scrollbar overflow-y-auto h-full">
      {renderedComponents.map((item, index) => (
        <div
          key={item.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ErrorBoundary fallback={<ComponentErrorFallback />}>
            {item.component}
          </ErrorBoundary>
        </div>
      ))}
    </div>
  );
}

export function TripPanel() {
  return (
    <div className="flex flex-col h-full bg-wander-cream relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" className="text-wander-charcoal" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-wander-copper/10 bg-wander-cream/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-lg font-semibold text-wander-charcoal tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trip Plan
            </h2>
            <p className="text-[11px] text-wander-slate tracking-wide uppercase">
              Your Itinerary
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative z-10">
        <TripComponents />
      </div>
    </div>
  );
}
