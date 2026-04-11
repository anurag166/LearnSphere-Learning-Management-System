export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        richblack: {
          900: "#000814",
          800: "#001d3d",
          700: "#003566",
          200: "#ccddee",
        },
        yellow: {
          300: "#ffd60a",
        },
      },
    },
  },
  plugins: [],
};
