"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { z } from "zod";
import { useTamboStreamStatus } from "@tambo-ai/react";

/**
 * Zod schema for BudgetBreakdown props
 */
export const budgetBreakdownSchema = z.object({
  categories: z
    .array(
      z.object({
        name: z
          .string()
          .describe("Budget category: Accommodation, Food, Transport, Activities, or Miscellaneous"),
        amount: z.number().describe("Estimated cost in USD for this category"),
      })
    )
    .describe("Budget split across 4-6 categories"),
  totalBudget: z.number().describe("Total trip budget in USD"),
  currency: z.string().describe("Primary currency code like 'USD' or 'EUR'"),
  perDayAverage: z.number().describe("Average daily spend in USD"),
});

export type BudgetBreakdownProps = z.infer<typeof budgetBreakdownSchema>;

// Category colors matching our design system
const CATEGORY_COLORS: Record<string, string> = {
  Accommodation: "#b87333", // copper
  Food: "#d4a574", // copper-light
  Transport: "#3d3d4a", // charcoal
  Activities: "#6b6b7a", // slate
  Miscellaneous: "#a8a8b3", // muted
  Shopping: "#8b6914", // amber
  Entertainment: "#4a6b4a", // green
};

const DEFAULT_COLORS = ["#b87333", "#d4a574", "#3d3d4a", "#6b6b7a", "#a8a8b3", "#8b6914"];

/**
 * BudgetBreakdown Component
 *
 * Renders a budget breakdown chart showing how the trip budget is split
 * across categories. Use when the user asks about budget, costs, or spending.
 */
export function BudgetBreakdown({
  categories,
  totalBudget,
  currency,
  perDayAverage,
}: BudgetBreakdownProps) {
  const { streamStatus } = useTamboStreamStatus<BudgetBreakdownProps>();
  const isStreaming = !streamStatus.isSuccess;

  // Defensive defaults
  const safeCategories = categories?.length ? categories : [];
  const safeTotalBudget = totalBudget || 0;
  const safeCurrency = currency || "USD";
  const safePerDayAverage = perDayAverage || 0;

  // Handle empty state
  if (safeCategories.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-wander-copper/10 shadow-lg p-6 animate-fade-in-up">
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 mx-auto text-wander-copper/30 mb-3" />
          <p className="text-wander-slate text-sm">No budget data available yet</p>
        </div>
      </div>
    );
  }

  // Prepare chart data with defensive defaults
  const chartData = safeCategories.map((cat, index) => ({
    name: cat.name || "Other",
    value: cat.amount ?? 0,
    color: CATEGORY_COLORS[cat.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // Calculate total from categories (may differ from totalBudget)
  const calculatedTotal = safeCategories.reduce((sum, cat) => sum + (cat.amount ?? 0), 0) || 1;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const value = data.value ?? 0;
      const percentage = ((value / calculatedTotal) * 100).toFixed(1);
      return (
        <div className="bg-wander-charcoal text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <p className="font-medium">{data.name || "Category"}</p>
          <p className="text-wander-copper-light">
            ${value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-2xl bg-white border border-wander-copper/10 shadow-lg overflow-hidden animate-fade-in-up ${isStreaming ? 'animate-pulse' : ''}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-wander-copper/10 bg-wander-warm/30">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-semibold text-wander-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Budget Breakdown
            </h3>
            <p className="text-xs text-wander-slate mt-0.5">Estimated spending by category</p>
          </div>
          <div className="flex items-center gap-2">
            {isStreaming && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-wander-copper/10">
                <Loader2 className="w-3 h-3 text-wander-copper animate-spin" />
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-wander-copper/10 border border-wander-copper/20">
              <TrendingUp className="w-3.5 h-3.5 text-wander-copper" />
              <span className="text-xs font-medium text-wander-copper">
                ${safePerDayAverage.toLocaleString()}/day
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-8">
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-wander-slate uppercase tracking-wide">Total</span>
              <span
                className="text-2xl font-bold text-wander-charcoal"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ${safeTotalBudget.toLocaleString()}
              </span>
              <span className="text-xs text-wander-slate">{safeCurrency}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {chartData.map((item, index) => {
              const value = item.value ?? 0;
              const percentage = ((value / calculatedTotal) * 100).toFixed(0);
              return (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full transition-transform duration-200 group-hover:scale-125"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-wander-charcoal font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-wander-charcoal">
                      ${value.toLocaleString()}
                    </span>
                    <span className="text-xs text-wander-slate w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
