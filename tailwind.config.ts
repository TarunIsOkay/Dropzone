import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dz: {
          bg: "#0a0a0f",
          surface: "#12121a",
          elevated: "#1a1a26",
          border: "#2a2a3a",
          "border-light": "#3a3a4e",
          text: "#e8e8f0",
          "text-muted": "#8888a0",
          "text-dim": "#5a5a72",
          crimson: {
            50: "#fef2f2",
            100: "#ffe1e1",
            200: "#ffc8c8",
            300: "#ffa0a0",
            400: "#ff6b6b",
            500: "#dc2626",
            600: "#b91c1c",
            700: "#991b1b",
            800: "#7f1d1d",
            900: "#6b1a1a",
            DEFAULT: "#dc2626",
          },
          cyan: {
            400: "#22d3ee",
            500: "#06b6d4",
            600: "#0891b2",
            DEFAULT: "#06b6d4",
          },
          green: {
            400: "#4ade80",
            500: "#22c55e",
            600: "#16a34a",
            DEFAULT: "#22c55e",
          },
          amber: {
            400: "#fbbf24",
            500: "#f59e0b",
            600: "#d97706",
            DEFAULT: "#f59e0b",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "hero-gradient":
          "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.15) 0%, transparent 60%)",
        "surface-gradient":
          "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(220, 38, 38, 0.15)",
        "glow-lg": "0 0 40px rgba(220, 38, 38, 0.2)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.15)",
        card: "0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)",
        elevated:
          "0 4px 6px -1px rgba(0,0,0,0.4), 0 10px 20px -2px rgba(0,0,0,0.3)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
