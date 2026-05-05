// lib/firestore.ts
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile, MealEntry } from "@/types";
import { format } from "date-fns";

// ── USER PROFILE ──────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...data, uid, createdAt: new Date().toISOString() });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, data as Record<string, unknown>);
}

// ── MEALS ─────────────────────────────────────────────────────────────────────

export async function addMealEntry(
  userId: string,
  meal: Omit<MealEntry, "id">
): Promise<string> {
  const ref = collection(db, "meals", userId, "entries");
  const docRef = await addDoc(ref, meal);
  return docRef.id;
}

export async function updateMealEntry(
  userId: string,
  mealId: string,
  data: Partial<MealEntry>
): Promise<void> {
  const ref = doc(db, "meals", userId, "entries", mealId);
  await updateDoc(ref, data as Record<string, unknown>);
}

export async function deleteMealEntry(
  userId: string,
  mealId: string
): Promise<void> {
  const ref = doc(db, "meals", userId, "entries", mealId);
  await deleteDoc(ref);
}

export async function getTodaysMeals(userId: string): Promise<MealEntry[]> {
  const today = format(new Date(), "yyyy-MM-dd");
  const ref = collection(db, "meals", userId, "entries");
  const q = query(ref, where("date", "==", today), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MealEntry));
}

export async function getMonthMeals(
  userId: string,
  year: number,
  month: number
): Promise<MealEntry[]> {
  const startDate = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
  const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");
  const ref = collection(db, "meals", userId, "entries");
  const q = query(
    ref,
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc"),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MealEntry));
}

export function subscribeToTodaysMeals(
  userId: string,
  callback: (meals: MealEntry[]) => void
): Unsubscribe {
  const today = format(new Date(), "yyyy-MM-dd");
  const ref = collection(db, "meals", userId, "entries");
  const q = query(ref, where("date", "==", today), orderBy("timestamp", "desc"));

  return onSnapshot(q, (snap) => {
    const meals = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MealEntry));
    callback(meals);
  });
}

export function subscribeToMonthMeals(
  userId: string,
  year: number,
  month: number,
  callback: (meals: MealEntry[]) => void
): Unsubscribe {
  const startDate = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
  const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");
  const ref = collection(db, "meals", userId, "entries");
  const q = query(
    ref,
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc")
  );

  return onSnapshot(q, (snap) => {
    const meals = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MealEntry));
    callback(meals);
  });
}
