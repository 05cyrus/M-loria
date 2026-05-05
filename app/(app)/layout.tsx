// app/(app)/layout.tsx
"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Sidebar from "@/components/ui/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile?.setupComplete && pathname !== "/setup") {
      router.replace("/setup");
    }
  }, [user, profile, loading, profileLoading, router, pathname]);

  if (loading || profileLoading) return <LoadingScreen />;
  if (!user) return null;

  // Setup page has no sidebar
  if (pathname === "/setup") {
    return (
      <div className="min-h-dvh relative grain">
        <div className="bg-blobs">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex relative grain">
      <div className="bg-blobs">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>
      <Sidebar />
      <main className="relative z-10 flex-1 md:ml-64 min-h-dvh">
        {children}
      </main>
    </div>
  );
}
