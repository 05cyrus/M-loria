// components/meals/AddMealModal.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { estimateMealNutrition } from "@/lib/ai";
import { addMealEntry } from "@/lib/firestore";
import { format } from "date-fns";
import type { AIEstimation } from "@/types";
import {
  X, Sparkles, UtensilsCrossed, Check,
  Flame, Dumbbell, IndianRupee, AlertCircle
} from "lucide-react";
import { formatCalories, formatProtein, formatPrice } from "@/lib/utils";

interface Props {
  userId: string;
  onClose: () => void;
}

type Stage = "input" | "estimating" | "review" | "saving" | "done";

export default function AddMealModal({ userId, onClose }: Props) {
  const [mealName, setMealName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [estimation, setEstimation] = useState<AIEstimation | null>(null);
  const [editedEst, setEditedEst] = useState<AIEstimation | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Lock scroll
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleEstimate() {
    if (!mealName.trim() || !quantity.trim()) return;
    setError("");
    setStage("estimating");
    try {
      const result = await estimateMealNutrition(mealName, quantity);
      setEstimation(result);
      setEditedEst(result);
      setStage("review");
    } catch (err: unknown) {
      setError((err as Error).message || "AI estimation failed. Please try again.");
      setStage("input");
    }
  }

  async function handleSave() {
    if (!editedEst) return;
    setStage("saving");
    try {
      const now = new Date();
      await addMealEntry(userId, {
        userId,
        name: mealName,
        quantity,
        calories: editedEst.calories,
        protein: editedEst.protein,
        price: editedEst.price,
        timestamp: now.toISOString(),
        date: format(now, "yyyy-MM-dd"),
      });
      setStage("done");
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setError((err as Error).message);
      setStage("review");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md glass rounded-3xl p-6 shadow-card animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-forest-400" />
            <h2 className="font-semibold text-slate-100">
              {stage === "review" || stage === "saving" || stage === "done"
                ? "Review Estimation"
                : "Add Meal"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* INPUT STAGE */}
        {(stage === "input" || stage === "estimating") && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Meal Name
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Dal Makhani, Chicken Biryani…"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEstimate()}
                className="input-base"
                disabled={stage === "estimating"}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Quantity / Portion
              </label>
              <input
                type="text"
                placeholder="e.g. 1 bowl, 2 chapatis, 300g…"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEstimate()}
                className="input-base"
                disabled={stage === "estimating"}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleEstimate}
              disabled={!mealName.trim() || !quantity.trim() || stage === "estimating"}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {stage === "estimating" ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
                  AI is estimating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Estimate with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* REVIEW STAGE */}
        {(stage === "review" || stage === "saving") && editedEst && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-700/20 rounded-2xl p-4 border border-white/5">
              <p className="text-slate-300 font-medium text-sm">{mealName}</p>
              <p className="text-slate-500 text-xs mt-0.5">{quantity}</p>
            </div>

            <p className="text-xs text-slate-500 uppercase tracking-wider">
              AI Estimates — edit if needed
            </p>

            <div className="grid grid-cols-3 gap-3">
              <NutrientInput
                label="Calories"
                icon={<Flame className="w-3.5 h-3.5 text-rose-400" />}
                value={editedEst.calories}
                unit="kcal"
                onChange={(v) => setEditedEst((d) => d ? { ...d, calories: v } : d)}
              />
              <NutrientInput
                label="Protein"
                icon={<Dumbbell className="w-3.5 h-3.5 text-forest-400" />}
                value={editedEst.protein}
                unit="g"
                onChange={(v) => setEditedEst((d) => d ? { ...d, protein: v } : d)}
              />
              <NutrientInput
                label="Price"
                icon={<IndianRupee className="w-3.5 h-3.5 text-amber-400" />}
                value={editedEst.price ?? 0}
                unit="₹"
                onChange={(v) => setEditedEst((d) => d ? { ...d, price: v || null } : d)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStage("input")}
                className="btn-secondary flex-1"
                disabled={stage === "saving"}
              >
                ← Edit
              </button>
              <button
                onClick={handleSave}
                disabled={stage === "saving"}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {stage === "saving" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save meal
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* DONE STAGE */}
        {stage === "done" && (
          <div className="flex flex-col items-center gap-3 py-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-forest-500/20 border border-forest-500/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-forest-400" />
            </div>
            <p className="text-slate-200 font-medium">Meal logged!</p>
            <p className="text-slate-500 text-sm">Dashboard is updating…</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NutrientInput({
  label,
  icon,
  value,
  unit,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="bg-slate-700/30 rounded-xl p-3 border border-white/[0.06]">
      <div className="flex items-center gap-1 mb-2">
        {icon}
        <span className="text-slate-400 text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent text-slate-100 font-mono text-sm focus:outline-none"
        min={0}
      />
      <span className="text-slate-500 text-[10px]">{unit}</span>
    </div>
  );
}
