/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        teachment: {
          blue: '#2563eb',
          purple: '#6366f1',
          accent: '#4f46e5'
        }
      }
    },
  },
  plugins: [],
}
