/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:       "#0d1117",
        surface:  "#161b22",
        border:   "#30363d",
        muted:    "#8b949e",
        primary:  "#e6edf3",
        accent:   "#58a6ff",
        critical: "#ff4d4f",
        high:     "#fa8c16",
        medium:   "#fadb14",
        low:      "#52c41a",
        success:  "#3fb950",
        "critical-bg":     "#2d1216",
        "critical-border": "#5c1e22",
        "high-bg":         "#2b1a08",
        "high-border":     "#5b3408",
        "medium-bg":       "#2b2508",
        "medium-border":   "#5b4f08",
        "low-bg":          "#0d2010",
        "low-border":      "#185224",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
