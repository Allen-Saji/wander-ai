"use client";

import { withInteractable, useTamboStreamStatus } from "@tambo-ai/react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Home,
  Utensils,
  Bus,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  Loader2,
  PiggyBank,
  AlertCircle,
} from "lucide-react";
import { z } from "zod";

/**
 * Expense category configuration
 */
const CATEGORY_CONFIG = {
  accommodation: {
    icon: Home,
    color: "bg-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
  },
  food: {
    icon: Utensils,
    color: "bg-orange-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600",
  },
  transport: {
    icon: Bus,
    color: "bg-slate-500",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-600",
  },
  activities: {
    icon: Ticket,
    color: "bg-purple-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
  },
  shopping: {
    icon: ShoppingBag,
    color: "bg-pink-500",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-600",
  },
  other: {
    icon: MoreHorizontal,
    color: "bg-gray-500",
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-600",
  },
};

/**
 * Zod schema for a single expense item
 */
const expenseItemSchema = z.object({
  name: z.string().describe("Name of the expense like 'Hotel booking' or 'Airport taxi'"),
  category: z
    .enum(["accommodation", "food", "transport", "activities", "shopping", "other"])
    .describe("Expense category"),
  amount: z.number().describe("Cost in the trip's primary currency"),
  day: z.number().optional().describe("Which day of the trip this expense is for (optional)"),
  isPaid: z.boolean().optional().describe("Whether this expense has been paid (optional, defaults to false)"),
});

/**
 * Zod schema for BudgetTracker props
 */
export const budgetTrackerSchema = z.object({
  tripName: z.string().describe("Name of the trip like 'Tokyo Adventure' or 'Paris Getaway'"),
  totalBudget: z.number().describe("Total trip budget in the primary currency"),
  currency: z.string().describe("Currency code like 'USD' or 'EUR'"),
  expenses: z
    .array(expenseItemSchema)
    .describe("List of expense items to track. Include both planned and actual expenses."),
  savingsGoal: z.number().optional().describe("Optional savings goal - amount to keep under budget"),
});

export type BudgetTrackerProps = z.infer<typeof budgetTrackerSchema>;
type ExpenseItem = z.infer<typeof expenseItemSchema>;

/**
 * Single Expense Row
 */
function ExpenseRow({ expense }: { expense: ExpenseItem }) {
  const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other;
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-wander-copper/5 last:border-0 group">
      {/* Category Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center`}>
        <IconComponent className={`w-4 h-4 ${config.textColor}`} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-wander-charcoal truncate">
            {expense.name || "Expense"}
          </h4>
          {expense.day && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-wander-slate/10 text-wander-slate">
              Day {expense.day}
            </span>
          )}
        </div>
        <span className={`text-xs capitalize ${config.textColor}`}>{expense.category}</span>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2">
        {expense.isPaid && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">
            Paid
          </span>
        )}
        <span className="text-sm font-semibold text-wander-charcoal">
          ${expense.amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/**
 * Category Summary Bar
 */
function CategorySummary({ expenses, totalBudget }: { expenses: ExpenseItem[]; totalBudget: number }) {
  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-wander-slate/10">
      {categories.map(([category, amount]) => {
        const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
        const percentage = Math.max((amount / totalBudget) * 100, 2);
        return (
          <div
            key={category}
            className={`${config.color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
            title={`${category}: $${amount.toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}

/**
 * BudgetTracker Base Component
 *
 * Tracks trip expenses against budget. Updates in place when the user
 * adds, removes, or modifies expenses through conversation.
 */
function BudgetTrackerBase({
  tripName,
  totalBudget,
  currency,
  expenses,
  savingsGoal,
}: BudgetTrackerProps) {
  const { streamStatus } = useTamboStreamStatus<BudgetTrackerProps>();
  const isStreaming = !streamStatus.isSuccess;

  // Defensive defaults
  const safeTripName = tripName || "Trip Budget";
  const safeTotalBudget = totalBudget || 0;
  const safeCurrency = currency || "USD";
  const safeExpenses = expenses?.length ? expenses : [];
  const safeSavingsGoal = savingsGoal || 0;

  // Calculations
  const totalSpent = safeExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remaining = safeTotalBudget - totalSpent;
  const percentSpent = safeTotalBudget > 0 ? (totalSpent / safeTotalBudget) * 100 : 0;
  const isOverBudget = remaining < 0;
  const meetsSavingsGoal = remaining >= safeSavingsGoal;

  // Group expenses by paid status
  const paidExpenses = safeExpenses.filter((e) => e.isPaid);
  const unpaidExpenses = safeExpenses.filter((e) => !e.isPaid);
  const paidTotal = paidExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className={`rounded-2xl bg-white border border-wander-copper/10 shadow-lg overflow-hidden animate-fade-in-up ${isStreaming ? 'animate-pulse' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-wander-charcoal to-wander-slate px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-wander-copper/20 flex items-center justify-center border border-wander-copper/30">
              <Wallet className="w-5 h-5 text-wander-copper-light" />
            </div>
            <div>
              <h3
                className="text-lg font-semibold text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {safeTripName}
              </h3>
              <span className="text-xs text-wander-copper-light">Budget Tracker</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isStreaming && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-wander-copper/20">
                <Loader2 className="w-3 h-3 text-wander-copper-light animate-spin" />
              </div>
            )}
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wide text-wander-slate">Total Budget</span>
              <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                ${safeTotalBudget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="px-5 py-4 bg-wander-warm/30 border-b border-wander-copper/10">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-wander-slate">Spent</span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-wander-charcoal'}`}>
              {percentSpent.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-wander-slate/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : percentSpent > 80
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-wander-copper to-wander-copper-light'
              }`}
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            />
          </div>
        </div>

        {/* Category Breakdown Bar */}
        <CategorySummary expenses={safeExpenses} totalBudget={safeTotalBudget} />

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isOverBudget ? 'bg-red-100' : 'bg-emerald-100'
            }`}>
              {isOverBudget ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wide text-wander-slate">
                {isOverBudget ? 'Over Budget' : 'Remaining'}
              </span>
              <p className={`text-lg font-bold ${isOverBudget ? 'text-red-500' : 'text-emerald-600'}`}>
                {isOverBudget ? '-' : ''}${Math.abs(remaining).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wide text-wander-slate">Spent</span>
            <p className="text-lg font-bold text-wander-charcoal">
              ${totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Savings Goal */}
        {safeSavingsGoal > 0 && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg ${
            meetsSavingsGoal ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            <PiggyBank className={`w-4 h-4 ${meetsSavingsGoal ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className={`text-xs font-medium ${meetsSavingsGoal ? 'text-emerald-700' : 'text-amber-700'}`}>
              {meetsSavingsGoal
                ? `On track! $${(remaining - safeSavingsGoal).toLocaleString()} extra saved`
                : `$${(safeSavingsGoal - remaining).toLocaleString()} more needed to meet savings goal`
              }
            </span>
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="px-5 py-4">
        {safeExpenses.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-10 h-10 mx-auto text-wander-copper/30 mb-3" />
            <p className="text-sm text-wander-slate">No expenses tracked yet</p>
            <p className="text-xs text-wander-slate/60 mt-1">Tell me about your expenses to start tracking</p>
          </div>
        ) : (
          <div>
            {/* Unpaid/Planned Expenses */}
            {unpaidExpenses.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-3.5 h-3.5 text-wander-slate" />
                  <span className="text-xs font-medium text-wander-slate uppercase tracking-wide">
                    Planned ({unpaidExpenses.length})
                  </span>
                </div>
                <div className="bg-wander-warm/20 rounded-xl px-4">
                  {unpaidExpenses.map((expense, index) => (
                    <ExpenseRow key={`unpaid-${expense.name}-${index}`} expense={expense} />
                  ))}
                </div>
              </div>
            )}

            {/* Paid Expenses */}
            {paidExpenses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Minus className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-wander-slate uppercase tracking-wide">
                      Paid ({paidExpenses.length})
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">
                    ${paidTotal.toLocaleString()}
                  </span>
                </div>
                <div className="bg-emerald-50/50 rounded-xl px-4">
                  {paidExpenses.map((expense, index) => (
                    <ExpenseRow key={`paid-${expense.name}-${index}`} expense={expense} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {safeExpenses.length > 0 && (
        <div className="px-5 py-3 bg-wander-slate/5 border-t border-wander-copper/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-wander-slate">
              {safeExpenses.length} {safeExpenses.length === 1 ? 'expense' : 'expenses'} • {safeCurrency}
            </span>
            {isOverBudget && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="font-medium">Over budget by ${Math.abs(remaining).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Interactable BudgetTracker Component
 *
 * Wrapped with withInteractable to allow the AI to update expenses
 * in place when the user adds, removes, or modifies budget items.
 */
export const BudgetTracker = withInteractable(BudgetTrackerBase, {
  componentName: "BudgetTracker",
  description:
    "Tracks trip expenses against a budget. Use this when the user wants to track spending, add expenses, or monitor their budget throughout the trip. Each BudgetTracker has a unique ID like 'budget-tracker-1'. When the user asks to add an expense (e.g., 'add $50 for dinner'), update the existing BudgetTracker's expenses array rather than creating a new one. Mark expenses as isPaid: true when the user confirms payment.",
  propsSchema: budgetTrackerSchema,
});
