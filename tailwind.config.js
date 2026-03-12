/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient-shift 30s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'blink-review': 'blink-review 1.5s ease-in-out infinite',
        'fade-slide-up': 'fade-slide-up 0.6s ease-out forwards',
      },
      backgroundSize: {
        'snip-gradient': '200% 200%',
      },
    },
  },
  plugins: [],
}

