/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hw: {
          blue: '#005bac',
          navy: '#0b1f3a',
          orange: '#f7681e',
          yellow: '#ffc906',
          red: '#e4002b',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(11,31,58,0.08), 0 8px 24px -12px rgba(11,31,58,0.18)',
      },
    },
  },
  plugins: [],
};
