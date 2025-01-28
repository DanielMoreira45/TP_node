import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      // Allow all classes, because we don't know which classes are used in the consumer
      pattern: /./,
    }
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      }
    },
  },
  plugins: [],
} satisfies Config;
