/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'scale-98': 'scale(0.98)',
        'scale-105': 'scale(1.05)',
      },
      backdropBlur: {
        'xl': '24px',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      boxShadow: {
        'modern': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'modern-lg': '0 20px 40px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
};
