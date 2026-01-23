import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gh: {
          bg: "rgb(var(--gh-bg) / <alpha-value>)",
          bg2: "rgb(var(--gh-bg2) / <alpha-value>)",
          text: "rgb(var(--gh-text) / <alpha-value>)",
          muted: "rgb(var(--gh-muted) / <alpha-value>)",
          border: "rgb(var(--gh-border) / <alpha-value>)",
          primary: "rgb(var(--gh-primary) / <alpha-value>)",
          primary2: "rgb(var(--gh-primary-2) / <alpha-value>)",
          success: "rgb(var(--gh-success) / <alpha-value>)",
          danger: "rgb(var(--gh-danger) / <alpha-value>)",
          warning: "rgb(var(--gh-warning) / <alpha-value>)",
          chip: "rgb(var(--gh-chip) / <alpha-value>)",
          chipText: "rgb(var(--gh-chipText) / <alpha-value>)"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
