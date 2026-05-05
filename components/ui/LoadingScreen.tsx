// components/ui/LoadingScreen.tsx
import { Leaf } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-900 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-forest-700/30 border border-forest-600/30 flex items-center justify-center shadow-glow-forest">
        <Leaf className="w-7 h-7 text-forest-400 animate-pulse" strokeWidth={1.5} />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
