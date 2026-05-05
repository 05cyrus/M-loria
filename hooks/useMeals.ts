"use client";
// hooks/useMeals.ts
import { useEffect, useState } from "react";
import { subscribeToTodaysMeals, subscribeToMonthMeals } from "@/lib/firestore";
import type { MealEntry, DailyTotals } from "@/types";
import { groupMealsByDate } from "@/lib/utils";

export function useTodaysMeals(userId: string | undefined) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, price: 0 });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToTodaysMeals(userId, (data) => {
      setMeals(data);
      setTotals({
        calories: data.reduce((s, m) => s + m.calories, 0),
        protein: data.reduce((s, m) => s + m.protein, 0),
        price: data.reduce((s, m) => s + (m.price ?? 0), 0),
      });
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  return { meals, loading, totals };
}

export function useMonthMeals(
  userId: string | undefined,
  year: number,
  month: number
) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToMonthMeals(userId, year, month, (data) => {
      setMeals(data);
      setDailyTotals(groupMealsByDate(data) as DailyTotals[]);
      setLoading(false);
    });

    return unsub;
  }, [userId, year, month]);

  return { meals, dailyTotals, loading };
}
