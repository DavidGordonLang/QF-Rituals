/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          400: "#1FA2A6",
          500: "#178F8F",
          600: "#137C7C",
          700: "#106A6A"
        },
        ocean: {
          500: "#2072A6",
          600: "#1A5F8F"
        },
        // used for translucent cards
        charcoal: "#0F1C24"
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.25)",
        inset: "inset 0 0 24px rgba(0,0,0,0.35)"
      },
      borderRadius: { "2xl": "1.25rem" }
    }
  },
  plugins: []
};
