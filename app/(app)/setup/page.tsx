// app/(app)/setup/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { calculateGoals } from "@/lib/ai";
import { updateUserProfile } from "@/lib/firestore";
import { calculateAge } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { AIGoalResult } from "@/types";
import {
  Leaf, User, Phone, Calendar, Ruler, Weight,
  Sparkles, ArrowRight, CheckCircle2, Target,
  TrendingDown, TrendingUp, Activity
} from "lucide-react";

type Step = "info" | "ai_result" | "select_goal";

export default function SetupPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("info");
  const [form, setForm] = useState({
    name: "", phone: "", dob: "", height: "", weight: "",
  });
  const debouncedForm = useDebounce(form, 500);

  const [aiResult, setAiResult] = useState<AIGoalResult | null>(null);
  const [goalType, setGoalType] = useState<"weight_loss" | "muscle_gain" | "maintain" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  useEffect(() => {
    async function getAiGoals() {
      if (debouncedForm.dob && debouncedForm.height && debouncedForm.weight && debouncedForm.name) {
        setError("");
        setLoading(true);
        try {
          const age = calculateAge(debouncedForm.dob);
          const result = await calculateGoals({
            name: debouncedForm.name,
            age,
            height: Number(debouncedForm.height),
            weight: Number(debouncedForm.weight),
          });
          setAiResult(result);
          setStep("ai_result");
        } catch (err: unknown) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      }
    }
    getAiGoals();
  }, [debouncedForm]);

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (aiResult) {
      setStep("ai_result");
    }
  }

  async function handleGoalSubmit() {
    if (!goalType || !aiResult || !user) return;
    setLoading(true);
    setError("");
    try {
      const age = calculateAge(form.dob);
      await updateUserProfile(user.uid, {
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        age,
        height: Number(form.height),
        weight: Number(form.weight),
        maintenanceCalories: aiResult.maintenanceCalories,
        goalCalories: aiResult.goalCalories[goalType],
        goalType,
        recommendation: aiResult.recommendation,
        setupComplete: true,
      });
      await refreshProfile();
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const goalOptions = [
    {
      type: "weight_loss" as const,
      label: "Weight Loss",
      desc: "Calorie deficit to shed fat",
      icon: TrendingDown,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/25",
      activeBg: "bg-rose-500/20 border-rose-400/50",
      calories: aiResult?.goalCalories.weight_loss,
    },
    {
      type: "maintain" as const,
      label: "Maintain",
      desc: "Stay at current weight",
      icon: Activity,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/25",
      activeBg: "bg-amber-500/20 border-amber-400/50",
      calories: aiResult?.goalCalories.maintain,
    },
    {
      type: "muscle_gain" as const,
      label: "Muscle Gain",
      desc: "Calorie surplus to build muscle",
      icon: TrendingUp,
      color: "text-forest-400",
      bg: "bg-forest-500/10 border-forest-500/25",
      activeBg: "bg-forest-500/20 border-forest-400/50",
      calories: aiResult?.goalCalories.muscle_gain,
    },
  ];

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest-700/30 border border-forest-600/30 mb-3 shadow-glow-forest">
            <Leaf className="w-6 h-6 text-forest-400" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl text-slate-100">Let&apos;s set up your goals</h1>
          <p className="text-slate-400 text-sm mt-2">This helps Méloria personalise your experience</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {["info", "ai_result", "select_goal"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  s === step
                    ? "bg-forest-500 text-white"
                    : ["info", "ai_result", "select_goal"].indexOf(step) > i
                    ? "bg-forest-700/50 text-forest-400"
                    : "bg-slate-700/50 text-slate-500"
                }`}
              >
                {["info", "ai_result", "select_goal"].indexOf(step) > i ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && <div className={`w-8 h-px transition-colors duration-300 ${["info", "ai_result", "select_goal"].indexOf(step) > i ? "bg-forest-600" : "bg-slate-700"}`} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8 shadow-card">
          {/* STEP 1: Info */}
          {step === "info" && (
            <form onSubmit={handleInfoSubmit} className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="input-base pl-10"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="input-base pl-10"
                    required
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    placeholder="Date of birth"
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    className="input-base pl-10"
                    required
                    max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split("T")[0]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      placeholder="Height (cm)"
                      value={form.height}
                      onChange={(e) => handleChange("height", e.target.value)}
                      className="input-base pl-10"
                      required
                      min={100}
                      max={250}
                    />
                  </div>
                  <div className="relative">
                    <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={form.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      className="input-base pl-10"
                      required
                      min={30}
                      max={300}
                    />
                  </div>
                </div>
              </div>

              {form.dob && (
                <div className="bg-slate-700/30 rounded-xl px-4 py-2 text-sm text-slate-400">
                  Age:{" "}
                  <span className="text-slate-200 font-medium">
                    {calculateAge(form.dob)} years
                  </span>
                </div>
              )}

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    AI is calculating…
                  </>
                ) : (
                  <>
                    Calculate with AI
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: AI Result */}
          {step === "ai_result" && aiResult && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">AI Analysis Complete</h3>
                <p className="text-slate-400 text-sm mt-1 italic">&ldquo;{aiResult.recommendation}&rdquo;</p>
              </div>

              <div className="bg-slate-700/20 rounded-2xl p-5 text-center border border-white/5">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Maintenance Calories</p>
                <p className="font-display text-5xl text-slate-100">{aiResult.maintenanceCalories.toLocaleString()}</p>
                <p className="text-slate-400 text-sm mt-1">kcal / day</p>
              </div>

              <button
                onClick={() => setStep("select_goal")}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Choose your goal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Select Goal */}
          {step === "select_goal" && aiResult && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">What&apos;s your goal?</h3>
                <p className="text-slate-400 text-sm mt-1">Select what you&apos;d like to focus on</p>
              </div>

              <div className="space-y-3">
                {goalOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = goalType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => setGoalType(opt.type)}
                      className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 ${
                        isSelected ? opt.activeBg : opt.bg
                      } hover:scale-[1.01]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800/50`}>
                            <Icon className={`w-5 h-5 ${opt.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-100 text-sm">{opt.label}</p>
                            <p className="text-slate-400 text-xs">{opt.desc}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono text-sm font-medium ${opt.color}`}>
                            {opt.calories?.toLocaleString()}
                          </p>
                          <p className="text-slate-500 text-xs">kcal</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoalSubmit}
                disabled={!goalType || loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Start tracking
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
