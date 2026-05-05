// components/ui/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  Leaf, LayoutDashboard, UtensilsCrossed,
  LogOut, User, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meals", label: "All Meals", icon: UtensilsCrossed },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.replace("/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col glass border-r border-white/[0.06] z-30 p-5">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-forest-700/40 border border-forest-600/30 flex items-center justify-center group-hover:shadow-glow-forest transition-all">
            <Leaf className="w-5 h-5 text-forest-400" strokeWidth={1.5} />
          </div>
          <span className="font-display text-2xl text-slate-100">Méloria</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-forest-500/15 text-forest-300 border border-forest-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-forest-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="border-t border-white/[0.06] pt-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-700/20">
            <div className="w-8 h-8 rounded-full bg-forest-700/40 border border-forest-600/30 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-forest-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-slate-200 text-sm font-medium truncate">{profile?.name || "User"}</p>
              <p className="text-slate-500 text-xs truncate">{profile?.goalType?.replace("_", " ")}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 glass border-b border-white/[0.06] z-30 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-forest-400" strokeWidth={1.5} />
          <span className="font-display text-xl text-slate-100">Méloria</span>
        </Link>
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isActive
                    ? "bg-forest-500/20 text-forest-300"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile top spacer */}
      <div className="md:hidden h-14" />
    </>
  );
}
