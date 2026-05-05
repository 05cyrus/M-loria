// app/(app)/verify-email/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { sendEmailVerification } from "firebase/auth";
import { Leaf, Mail, CheckCircle, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  async function handleResendEmail() {
    setError("");
    setLoading(true);
    try {
      if (!user) throw new Error("No user found");
      await sendEmailVerification(user);
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (err) {
      setError("Failed to resend email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    setLoading(true);
    try {
      if (!user) throw new Error("No user found");
      // Refresh the user to check if email is verified
      await user.reload();
      if (user.emailVerified) {
        router.replace("/setup");
      } else {
        setError("Please verify your email before continuing.");
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to check verification status. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest-700/30 border border-forest-600/30 mb-4 shadow-glow-forest">
          <Leaf className="w-7 h-7 text-forest-400" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-4xl text-slate-100 tracking-tight">Méloria</h1>
        <p className="text-slate-400 text-sm mt-2 font-light">
          Your AI-powered nutrition companion
        </p>
      </div>

      {/* Card */}
      <div className="glass rounded-3xl p-8 shadow-card">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest-500/20 border border-forest-500/30">
            <Mail className="w-8 h-8 text-forest-400" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-slate-100 text-center mb-2">
          Verify your email
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          We've sent a verification link to <span className="text-forest-300 font-medium">{user?.email}</span>
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {resent && (
          <div className="mb-6 p-4 bg-forest-500/10 border border-forest-500/30 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-forest-300" />
            <p className="text-forest-300 text-sm">Verification email sent!</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            Click the link in the email to verify your account. Then click the button below to continue to setup.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            I've verified my email
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="btn-secondary w-full"
          >
            {loading ? "Sending..." : "Resend verification email"}
          </button>
        </div>

        <p className="text-slate-500 text-xs text-center mt-6">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
}
