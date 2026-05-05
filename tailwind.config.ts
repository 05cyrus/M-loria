import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        cream: {
          50: "#FDFAF4",
          100: "#F9F3E3",
          200: "#F2E8CC",
        },
        forest: {
          400: "#5C8C6A",
          500: "#3D6B50",
          600: "#2D5040",
          700: "#1E3829",
          800: "#132419",
          900: "#0A1510",
        },
        amber: {
          300: "#F6C869",
          400: "#F3B740",
          500: "#E8A020",
        },
        rose: {
          300: "#E8958A",
          400: "#D97066",
          500: "#C45548",
        },
        slate: {
          900: "#0F1117",
          800: "#1A1E2A",
          700: "#252B3B",
          600: "#333B50",
          500: "#4A5568",
          400: "#718096",
          300: "#A0AEC0",
          200: "#CBD5E0",
          100: "#EDF2F7",
        },
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "card": "0 2px 20px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.15)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
        "glow-forest": "0 0 30px rgba(61, 107, 80, 0.35)",
        "glow-amber": "0 0 30px rgba(243, 183, 64, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
