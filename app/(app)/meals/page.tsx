// app/(app)/meals/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMonthMeals } from "@/hooks/useMeals";
import AddMealModal from "@/components/meals/AddMealModal";
import { format, parseISO } from "date-fns";
import { formatCalories, formatProtein, formatPrice } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight, Flame, Dumbbell, IndianRupee } from "lucide-react";
import type { MealEntry } from "@/types";

export default function MealsPage() {
  const { user, profile } = useAuth();
  const [showAddMeal, setShowAddMeal] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { dailyTotals, meals, loading } = useMonthMeals(user?.uid, year, month);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    const n = new Date();
    if (year > n.getFullYear() || (year === n.getFullYear() && month >= n.getMonth() + 1)) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Group meals by date
  const mealsByDate = meals.reduce((acc, m) => {
    acc[m.date] = acc[m.date] || [];
    acc[m.date].push(m);
    return acc;
  }, {} as Record<string, MealEntry[]>);

  const sortedDates = Object.keys(mealsByDate).sort((a, b) => b.localeCompare(a));

  const monthTotal = {
    calories: dailyTotals.reduce((s, d) => s + d.totalCalories, 0),
    protein: dailyTotals.reduce((s, d) => s + d.totalProtein, 0),
    price: dailyTotals.reduce((s, d) => s + d.totalPrice, 0),
  };

  return (
    <div className="min-h-dvh p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 animate-slide-up">
        <div>
          <h1 className="font-display text-3xl text-slate-100">Meal History</h1>
          <p className="text-slate-400 text-sm mt-0.5">All your logged meals</p>
        </div>
        <button
          onClick={() => setShowAddMeal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add meal</span>
        </button>
      </header>

      {/* Month selector */}
      <div className="glass rounded-2xl p-4 mb-4 flex items-center justify-between animate-slide-up" style={{ animationDelay: "50ms" }}>
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-display text-xl text-slate-100">
            {format(new Date(year, month - 1, 1), "MMMM yyyy")}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">{dailyTotals.length} days tracked</p>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all disabled:opacity-30"
          disabled={year === now.getFullYear() && month >= now.getMonth() + 1}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Month totals */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="glass rounded-2xl p-3 text-center">
          <Flame className="w-4 h-4 text-rose-400 mx-auto mb-1" />
          <p className="font-mono text-sm font-medium text-slate-100">{formatCalories(monthTotal.calories)}</p>
          <p className="text-slate-500 text-xs">total kcal</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <Dumbbell className="w-4 h-4 text-forest-400 mx-auto mb-1" />
          <p className="font-mono text-sm font-medium text-slate-100">{formatProtein(monthTotal.protein)}</p>
          <p className="text-slate-500 text-xs">total protein</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <IndianRupee className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="font-mono text-sm font-medium text-slate-100">{formatPrice(monthTotal.price)}</p>
          <p className="text-slate-500 text-xs">total spent</p>
        </div>
      </div>

      {/* Meals grouped by day */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-16 rounded-2xl" />
              <div className="skeleton h-16 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-slate-400 text-sm">No meals logged in {format(new Date(year, month - 1, 1), "MMMM")}.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {sortedDates.map((date) => {
            const dayMeals = mealsByDate[date];
            const dayTotal = dayMeals.reduce((s, m) => s + m.calories, 0);
            const parsedDate = parseISO(date);
            const isToday = date === format(now, "yyyy-MM-dd");

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-300 text-sm">
                    {isToday ? "Today" : format(parsedDate, "EEEE, MMMM d")}
                  </h3>
                  <span className="font-mono text-xs text-slate-500">
                    {formatCalories(dayTotal)} kcal
                  </span>
                </div>
                <div className="space-y-2">
                  {dayMeals.map((meal) => (
                    <div key={meal.id} className="glass rounded-2xl px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-200 text-sm font-medium">{meal.name}</p>
                          <p className="text-slate-500 text-xs">{meal.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-rose-400 font-mono">{formatCalories(meal.calories)}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-forest-400 font-mono">{formatProtein(meal.protein)}</span>
                          {meal.price && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="text-amber-400 font-mono">{formatPrice(meal.price)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddMeal(true)}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-forest-500 hover:bg-forest-400 text-white shadow-glow-forest flex items-center justify-center active:scale-95 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAddMeal && (
        <AddMealModal
          userId={user?.uid || ""}
          onClose={() => setShowAddMeal(false)}
        />
      )}
    </div>
  );
}
