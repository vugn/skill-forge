/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "deep-navy": "#020724",
        "dark-blue": "#051739",
        gold: "#FFD44D",
        purple: "#7F61FF",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 3s ease-in-out infinite",
        particle: "particle 4s linear infinite",
        "gentle-pulse": "gentle-pulse 3s ease-in-out infinite",
        "badge-float": "badge-float 4s ease-in-out infinite",
        "skill-unlock": "skill-unlock 0.8s ease-out",
        "skill-glow": "skill-glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(255, 212, 77, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(255, 212, 77, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        particle: {
          "0%": { transform: "rotate(0deg) translateX(0px) rotate(0deg)" },
          "100%": {
            transform: "rotate(360deg) translateX(100px) rotate(-360deg)",
          },
        },
        "gentle-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "badge-float": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-6px) scale(1.02)" },
        },
        "skill-unlock": {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(180deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(360deg)", opacity: "1" },
        },
        "skill-glow": {
          "0%": { boxShadow: "0 0 10px rgba(127, 97, 255, 0.5)" },
          "100%": {
            boxShadow:
              "0 0 25px rgba(127, 97, 255, 0.8), 0 0 35px rgba(127, 97, 255, 0.4)",
          },
        },
      },
      borderWidth: {
        3: "3px",
        4: "4px",
      },
      safelist: [
        {
          pattern: /bg-(red|green|purple)-(900|500|700)/,
          variants: ["hover"],
        },
        {
          pattern: /border-(red|green|purple)-500/,
        },
        {
          pattern: /text-(red|green|purple)-300/,
        },
        {
          pattern: /from-(red|green|purple)-500/,
        },
        {
          pattern: /to-(red|green|purple)-700/,
        },
        {
          pattern: /shadow-(red|green|purple)-500/,
        },
      ],
    },
  },
  plugins: [],
};
