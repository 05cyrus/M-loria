// components/meals/TodaysMeals.tsx
"use client";
import { useState } from "react";
import type { MealEntry } from "@/types";
import { deleteMealEntry, updateMealEntry } from "@/lib/firestore";
import { formatCalories, formatProtein, formatPrice } from "@/lib/utils";
import { Trash2, Pencil, Check, X, Utensils } from "lucide-react";

interface Props {
  meals: MealEntry[];
  loading: boolean;
  userId: string;
}

export default function TodaysMeals({ meals, loading, userId }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-700/50 flex items-center justify-center">
          <Utensils className="w-6 h-6 text-slate-500" />
        </div>
        <div>
          <p className="text-slate-300 font-medium text-sm">No meals logged yet</p>
          <p className="text-slate-500 text-xs mt-1">Add your first meal to start tracking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} userId={userId} />
      ))}
    </div>
  );
}

function MealCard({ meal, userId }: { meal: MealEntry; userId: string }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    calories: meal.calories,
    protein: meal.protein,
    price: meal.price ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateMealEntry(userId, meal.id, {
        calories: editData.calories,
        protein: editData.protein,
        price: editData.price || null,
      });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Remove this meal?")) return;
    setDeleting(true);
    try {
      await deleteMealEntry(userId, meal.id);
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  }

  return (
    <div
      className={`meal-card transition-all duration-200 ${
        deleting ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-medium text-slate-100 text-sm truncate">{meal.name}</h3>
            <span className="text-slate-500 text-xs">{meal.quantity}</span>
          </div>

          {editing ? (
            <div className="flex gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-slate-500 text-xs">kcal</span>
                <input
                  type="number"
                  value={editData.calories}
                  onChange={(e) => setEditData((d) => ({ ...d, calories: Number(e.target.value) }))}
                  className="w-16 bg-slate-700/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-forest-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500 text-xs">protein</span>
                <input
                  type="number"
                  value={editData.protein}
                  onChange={(e) => setEditData((d) => ({ ...d, protein: Number(e.target.value) }))}
                  className="w-14 bg-slate-700/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-forest-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500 text-xs">₹</span>
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData((d) => ({ ...d, price: Number(e.target.value) }))}
                  className="w-16 bg-slate-700/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-forest-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="pill bg-rose-500/10 text-rose-400">
                🔥 {formatCalories(meal.calories)} kcal
              </span>
              <span className="pill bg-forest-500/10 text-forest-400">
                💪 {formatProtein(meal.protein)}
              </span>
              {meal.price && (
                <span className="pill bg-amber-500/10 text-amber-400">
                  {formatPrice(meal.price)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-1.5 rounded-lg bg-forest-500/20 text-forest-400 hover:bg-forest-500/30 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
