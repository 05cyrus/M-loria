// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInYears, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(dob: string): number {
  return differenceInYears(new Date(), parseISO(dob));
}

export function formatCalories(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}

export function formatProtein(n: number): string {
  return `${Math.round(n)}g`;
}

export function formatPrice(n: number | null): string {
  if (n === null || n === 0) return "—";
  return `₹${n.toFixed(0)}`;
}

export function clampPercent(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.min((value / max) * 100, 100);
}

export function groupMealsByDate(
  meals: { date: string; calories: number; protein: number; price: number | null }[]
) {
  const grouped: Record<
    string,
    { date: string; totalCalories: number; totalProtein: number; totalMeals: number; totalPrice: number }
  > = {};

  for (const meal of meals) {
    if (!grouped[meal.date]) {
      grouped[meal.date] = {
        date: meal.date,
        totalCalories: 0,
        totalProtein: 0,
        totalMeals: 0,
        totalPrice: 0,
      };
    }
    grouped[meal.date].totalCalories += meal.calories;
    grouped[meal.date].totalProtein += meal.protein;
    grouped[meal.date].totalMeals += 1;
    grouped[meal.date].totalPrice += meal.price ?? 0;
  }

  return Object.values(grouped).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}
