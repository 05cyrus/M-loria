// app/api/ai/meal/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { mealName, quantity } = await req.json();

    if (!mealName || !quantity) {
      return NextResponse.json(
        { message: "mealName and quantity are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      // Return mock data if no API key configured
      console.log("No Google API key, returning mock meal estimation");
      return NextResponse.json(mockMealEstimation(mealName, quantity));
    }

    const prompt = `You are a nutrition expert for India. Estimate the nutritional content for the following meal.

Meal: ${mealName}
Quantity: ${quantity}

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "calories": <number, total kcal>,
  "protein": <number, grams>,
  "price": <number or null, estimated price in Indian Rupees (₹) at a typical Indian restaurant/home, null if unknown>
}

Be realistic and accurate for Indian cuisine context. If the meal is non-Indian, still estimate price in INR.`;

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

    // Strip any markdown fences
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      price: parsed.price ? Math.round(Number(parsed.price)) : null,
    });
  } catch (error) {
    console.error("Meal AI error:", error);
    // Fall back to mock on any error
    const { mealName, quantity } = await req.json().catch(() => ({
      mealName: "meal",
      quantity: "1 serving",
    }));
    return NextResponse.json(mockMealEstimation(mealName, quantity));
  }
}

function mockMealEstimation(mealName: string, quantity: string) {
  // Deterministic mock based on meal name
  const seed = mealName.toLowerCase().charCodeAt(0) || 65;
  return {
    calories: 200 + (seed % 400),
    protein: 10 + (seed % 30),
    price: 50 + (seed % 200),
  };
}
