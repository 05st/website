/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            blockquote: {
              quotes: "none",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
