// types/index.ts

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  dob: string; // ISO date string
  age: number;
  height: number; // cm
  weight: number; // kg
  maintenanceCalories: number;
  goalCalories: number;
  goalType: "weight_loss" | "muscle_gain" | "maintain";
  recommendation: string;
  createdAt: string;
  setupComplete: boolean;
}

export interface MealEntry {
  id: string;
  userId: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  price: number | null;
  timestamp: string; // ISO date string
  date: string; // YYYY-MM-DD for easy querying
}

export interface DailyTotals {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalMeals: number;
  totalPrice: number;
}

export interface AIEstimation {
  calories: number;
  protein: number;
  price: number | null;
}

export interface AIGoalResult {
  maintenanceCalories: number;
  recommendation: string;
  goalCalories: {
    weight_loss: number;
    muscle_gain: number;
    maintain: number;
  };
}

export interface MealFormData {
  name: string;
  quantity: string;
}

export interface GoalSetupFormData {
  name: string;
  phone: string;
  dob: string;
  height: string;
  weight: string;
}
