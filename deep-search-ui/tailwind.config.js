/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter var"',
          'Inter',
          'system-ui',
          'ui-sans-serif',
          'sans-serif',
        ],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        float: 'float 10s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 6s ease-in-out infinite',
      },
      backgroundImage: {
        'radial-grid':
          'radial-gradient(circle at top, rgba(56, 189, 248, 0.35), transparent 55%), radial-gradient(circle at bottom, rgba(168, 85, 247, 0.3), transparent 60%)',
      },
      boxShadow: {
        glow: '0 25px 65px -25px rgba(56, 189, 248, 0.65)',
      },
    },
  },
  plugins: [],
}
