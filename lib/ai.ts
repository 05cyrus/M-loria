// lib/ai.ts
// Central AI service - calls our own Next.js API routes which proxy to Anthropic
// This keeps the API key server-side only.

import type { AIEstimation, AIGoalResult } from "@/types";

export async function estimateMealNutrition(
  mealName: string,
  quantity: string
): Promise<AIEstimation> {
  const res = await fetch("/api/ai/meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mealName, quantity }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to estimate meal nutrition");
  }

  return res.json();
}

export async function calculateGoals(params: {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
}): Promise<AIGoalResult> {
  const res = await fetch("/api/ai/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to calculate goals");
  }

  return res.json();
}
