/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#101623",
          100: "#13203a",
          200: "#1b2f59",
          300: "#264178",
          400: "#2f5fa8",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e3a8a",
          900: "#172554",
          950: "#0d1b3a",
        },
        accent: {
          50: "#07271f",
          100: "#0b3b2f",
          200: "#0f5241",
          300: "#13674f",
          400: "#178a64",
          500: "#10b981",
          600: "#0f9f6f",
          700: "#0f7d5a",
          800: "#0d5f46",
          900: "#0b4333",
        },
        financial: {
          bg: "#0A0B0F",
          surface: "#111318",
          elevated: "#1A1D26",
          border: "rgba(255,255,255,0.10)",
          text: "#F1F5F9",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
