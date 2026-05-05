// components/meals/MonthlyOverview.tsx
"use client";
import type { DailyTotals } from "@/types";
import { formatCalories, formatProtein, formatPrice, clampPercent } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Flame, Dumbbell, UtensilsCrossed } from "lucide-react";

interface Props {
  dailyTotals: DailyTotals[];
  loading: boolean;
  goalCalories: number;
}

export default function MonthlyOverview({ dailyTotals, loading, goalCalories }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-14 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (dailyTotals.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-slate-500 text-sm">No data for this month yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {dailyTotals.map((day) => {
        const pct = clampPercent(day.totalCalories, goalCalories);
        const isOver = day.totalCalories > goalCalories;
        const barColor = isOver ? "bg-rose-500" : "bg-forest-500";
        const date = parseISO(day.date);

        return (
          <div key={day.date} className="glass rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-slate-300 text-xs font-medium">{format(date, "EEE")}</p>
                  <p className="font-mono font-semibold text-slate-100 text-base leading-none">{format(date, "d")}</p>
                </div>
                <div className="h-8 w-px bg-white/[0.06]" />
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Flame className="w-3 h-3 text-rose-400" />
                    {formatCalories(day.totalCalories)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Dumbbell className="w-3 h-3 text-forest-400" />
                    {formatProtein(day.totalProtein)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <UtensilsCrossed className="w-3 h-3 text-amber-400" />
                    {day.totalMeals}
                  </span>
                </div>
              </div>
              <span className={`text-xs font-mono ${isOver ? "text-rose-400" : "text-forest-400"}`}>
                {Math.round(pct)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
