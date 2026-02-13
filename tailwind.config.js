/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        guinda: {
          50: "#fff1f3",
          100: "#ffe4e8",
          200: "#fecdd6",
          300: "#fda4b4",
          400: "#fb718c",
          500: "#e11d48",
          600: "#be123c",
          700: "#9f1239",
          800: "#881337",
          900: "#6b102a",
        },
        graphite: {
          50: "#f6f6f7",
          100: "#e7e8ea",
          200: "#cfd2d6",
          300: "#a9b0b8",
          400: "#7a8592",
          500: "#59636f",
          600: "#444c56",
          700: "#333941",
          800: "#24282e",
          900: "#171a1f",
        },
      },
      boxShadow: {
        card: "0 8px 28px rgba(17, 24, 39, 0.12)",
      },
    },
  },
  plugins: [],
};
