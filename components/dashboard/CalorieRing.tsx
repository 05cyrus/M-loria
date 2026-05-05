// components/dashboard/CalorieRing.tsx
"use client";
import { useEffect, useState } from "react";
import { clampPercent } from "@/lib/utils";

interface Props {
  label: string;
  current: number;
  target: number;
  color: string;
  trailColor: string;
  size?: number;
  strokeWidth?: number;
}

export default function CalorieRing({
  label,
  current,
  target,
  color,
  trailColor,
  size = 140,
  strokeWidth = 10,
}: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = clampPercent(current, target);
  const offset = circumference - (animated ? (pct / 100) * circumference : 0);

  const isOver = current > target;
  const displayColor = isOver ? "#D97066" : color;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg]"
        >
          {/* Trail */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trailColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={displayColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease",
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            className="font-mono text-sm font-medium tabular-nums"
            style={{ color: displayColor }}
          >
            {Math.round(pct)}%
          </span>
          <span className="text-slate-500 text-[10px] font-light">{label}</span>
        </div>
      </div>
    </div>
  );
}
