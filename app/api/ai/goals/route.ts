// app/api/ai/goals/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, age, height, weight } = await req.json();

    if (!age || !height || !weight) {
      return NextResponse.json(
        { message: "age, height, and weight are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.log("No Google API key, returning mock goal calculation");
      return NextResponse.json(mockGoalCalculation(age, height, weight));
    }

    const prompt = `You are a certified nutritionist. Calculate maintenance calories and provide goal recommendations.

User: ${name}
Age: ${age} years
Height: ${height} cm
Weight: ${weight} kg

Calculate:
1. Maintenance calories using Mifflin-St Jeor formula with moderate activity (1.55 multiplier)
2. Goal calories for weight loss (deficit ~400 kcal)
3. Goal calories for muscle gain (surplus ~350 kcal)
4. A short, motivating one-line recommendation based on their BMI

BMI = ${(weight / Math.pow(height / 100, 2)).toFixed(1)}

Respond ONLY with a valid JSON object (no markdown):
{
  "maintenanceCalories": <number>,
  "recommendation": "<one-line motivating recommendation>",
  "goalCalories": {
    "weight_loss": <number>,
    "muscle_gain": <number>,
    "maintain": <same as maintenanceCalories>
  }
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      maintenanceCalories: Math.round(Number(parsed.maintenanceCalories)),
      recommendation: parsed.recommendation,
      goalCalories: {
        weight_loss: Math.round(Number(parsed.goalCalories.weight_loss)),
        muscle_gain: Math.round(Number(parsed.goalCalories.muscle_gain)),
        maintain: Math.round(Number(parsed.goalCalories.maintain)),
      },
    });
  } catch (error) {
    console.error("Goals AI error:", error);
    const { age, height, weight } = await req.json().catch(() => ({
      age: 25,
      height: 170,
      weight: 70,
    }));
    return NextResponse.json(mockGoalCalculation(age, height, weight));
  }
}

function mockGoalCalculation(age: number, height: number, weight: number) {
  // Mifflin-St Jeor (male average) × 1.55
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const maintenance = Math.round(bmr * 1.55);
  const bmi = weight / Math.pow(height / 100, 2);

  let recommendation = "Maintain current physique — you're in great shape!";
  if (bmi > 25) recommendation = "Focus on weight loss — small steps lead to big changes.";
  else if (bmi < 20) recommendation = "Focus on muscle gain — fuel your growth journey!";

  return {
    maintenanceCalories: maintenance,
    recommendation,
    goalCalories: {
      weight_loss: maintenance - 400,
      muscle_gain: maintenance + 350,
      maintain: maintenance,
    },
  };
}
