/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zlit: {
          bg: "#171719",
          surface: "#242427",
          hover: "#303034",
          white: "#F4F4F4",
          muted: "#929296",
          red: "#C8102E",
        },
      },
      borderRadius: {
        card: "28px",
        modal: "32px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};