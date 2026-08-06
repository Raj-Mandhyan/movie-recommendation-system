/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050409",
        glass: {
          DEFAULT: "rgba(10, 8, 20, 0.4)",
          hover: "rgba(18, 14, 36, 0.5)",
          border: "rgba(255, 255, 255, 0.05)",
          borderHover: "rgba(255, 255, 255, 0.09)",
        },
        neon: {
          violet: "#a855f7",
          cyan: "#06b6d4",
          rose: "#f43f5e",
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drift': 'drift 30s ease-in-out infinite',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}
