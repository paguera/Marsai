/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    backgroundPosition: {
      'bottom-4': 'center bottom 1rem',
      'top-4': 'center top 1rem',
      'center-bottom': 'center bottom',
    }
  },
  plugins: [],
}
