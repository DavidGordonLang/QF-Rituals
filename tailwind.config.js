/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      boxShadow: { soft: "0 10px 40px rgba(0,0,0,0.25)" },
    },
  },
  plugins: [],
};
