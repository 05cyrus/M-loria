// app/(app)/dashboard/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTodaysMeals, useMonthMeals } from "@/hooks/useMeals";
import CalorieRing from "@/components/dashboard/CalorieRing";
import TodaysMeals from "@/components/meals/TodaysMeals";
import MonthlyOverview from "@/components/meals/MonthlyOverview";
import AddMealModal from "@/components/meals/AddMealModal";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import { Plus, Flame, Dumbbell, IndianRupee, Calendar } from "lucide-react";
import { format } from "date-fns";
import { formatCalories, formatProtein, formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [showAddMeal, setShowAddMeal] = useState(false);
  const now = new Date();

  const { meals: todaysMeals, loading: mealsLoading, totals } = useTodaysMeals(user?.uid);
  const { dailyTotals, loading: monthLoading } = useMonthMeals(
    user?.uid,
    now.getFullYear(),
    now.getMonth() + 1
  );

  if (!profile) return <DashboardSkeleton />;

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = profile.name?.split(" ")[0] || "friend";

  return (
    <div className="min-h-dvh p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-start justify-between mb-8 animate-slide-up">
        <div>
          <p className="text-slate-400 text-sm font-light">{format(now, "EEEE, MMMM d")}</p>
          <h1 className="font-display text-3xl md:text-4xl text-slate-100 mt-0.5">
            {greeting()}, {firstName}
          </h1>
          {profile.recommendation && (
            <p className="text-slate-500 text-sm mt-1 italic">
              &ldquo;{profile.recommendation}&rdquo;
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddMeal(true)}
          className="btn-primary flex items-center gap-2 shadow-glow-forest"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add meal</span>
        </button>
      </header>

      {/* Calorie rings */}
      <section className="grid grid-cols-2 gap-4 mb-6 animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="glass rounded-3xl p-6 flex flex-col items-center gap-3">
          <CalorieRing
            label="Maintenance"
            current={totals.calories}
            target={profile.maintenanceCalories}
            color="#3D6B50"
            trailColor="rgba(61,107,80,0.15)"
          />
          <div className="text-center">
            <p className="text-slate-400 text-xs">
              {formatCalories(totals.calories)} / {formatCalories(profile.maintenanceCalories)} kcal
            </p>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 flex flex-col items-center gap-3">
          <CalorieRing
            label="Goal"
            current={totals.calories}
            target={profile.goalCalories}
            color="#F3B740"
            trailColor="rgba(243,183,64,0.15)"
          />
          <div className="text-center">
            <p className="text-slate-400 text-xs">
              {formatCalories(totals.calories)} / {formatCalories(profile.goalCalories)} kcal
            </p>
          </div>
        </div>
      </section>

      {/* Today's stats */}
      <section
        className="grid grid-cols-3 gap-3 mb-6 animate-slide-up"
        style={{ animationDelay: "100ms" }}
      >
        <StatCard
          icon={<Flame className="w-4 h-4 text-rose-400" />}
          label="Calories"
          value={formatCalories(totals.calories)}
          sub="kcal today"
          color="rose"
        />
        <StatCard
          icon={<Dumbbell className="w-4 h-4 text-forest-400" />}
          label="Protein"
          value={formatProtein(totals.protein)}
          sub="today"
          color="forest"
        />
        <StatCard
          icon={<IndianRupee className="w-4 h-4 text-amber-400" />}
          label="Spent"
          value={formatPrice(totals.price)}
          sub="today"
          color="amber"
        />
      </section>

      {/* Today's meals */}
      <section className="animate-slide-up mb-6" style={{ animationDelay: "150ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-200">Today&apos;s Meals</h2>
          <span className="pill bg-slate-700/50 text-slate-400">
            {todaysMeals.length} meals
          </span>
        </div>
        <TodaysMeals
          meals={todaysMeals}
          loading={mealsLoading}
          userId={user?.uid || ""}
        />
      </section>

      {/* Monthly overview */}
      <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-200">
            {format(now, "MMMM")} Overview
          </h2>
        </div>
        <MonthlyOverview
          dailyTotals={dailyTotals}
          loading={monthLoading}
          goalCalories={profile.goalCalories}
        />
      </section>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddMeal(true)}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-forest-500 hover:bg-forest-400 text-white shadow-glow-forest flex items-center justify-center active:scale-95 transition-all z-40"
        aria-label="Add meal"
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

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: "rose" | "forest" | "amber";
}) {
  const bg: Record<string, string> = {
    rose: "bg-rose-500/10 border-rose-500/15",
    forest: "bg-forest-500/10 border-forest-500/15",
    amber: "bg-amber-500/10 border-amber-500/15",
  };
  return (
    <div className={`rounded-2xl p-3 border ${bg[color]} flex flex-col gap-1.5`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-slate-400 text-xs">{label}</span>
      </div>
      <p className="font-mono font-medium text-slate-100 text-base leading-none">{value}</p>
      <p className="text-slate-500 text-xs">{sub}</p>
    </div>
  );
}
