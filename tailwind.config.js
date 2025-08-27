/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c1116",
        charcoal: "#1b1f24"
      },
      borderRadius: { "2xl": "1.25rem" },
      boxShadow: { soft: "0 8px 40px rgba(0,0,0,0.25)" }
    }
  },
  plugins: []
}
