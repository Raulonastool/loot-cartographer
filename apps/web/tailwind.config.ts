import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#1a140d",
        ink: "#e8ddb5",
        rule: "#9c8b66",
        gold: "#c9a227",
        terrain: {
          plains: "#b7c08a",
          marsh: "#7a8c6b",
          forest: "#5c7a52",
          mountains: "#9aa0a6",
          ruins: "#b08968",
          coast: "#6fa3a0",
          desert: "#d9b370",
          wasteland: "#a8675a",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", '"Cormorant Garamond"', "Garamond", "serif"],
        mono: ["var(--font-mono)", '"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
