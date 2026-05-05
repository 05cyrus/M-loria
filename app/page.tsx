// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function RootPage() {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || profileLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!profile?.setupComplete) {
      router.replace("/setup");
      return;
    }

    router.replace("/dashboard");
  }, [user, profile, loading, profileLoading, router]);

  return <LoadingScreen />;
}
