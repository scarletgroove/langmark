export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow:             '3px 3px 0px #ede9fe',
        cartoon:          '3px 3px 0px #ede9fe',
        'cartoon-yellow': '3px 3px 0px #fef3c7',
        'cartoon-green':  '3px 3px 0px #d1fae5',
        'cartoon-blue':   '3px 3px 0px #dbeafe',
        'cartoon-pink':   '3px 3px 0px #fce7f3',
      },
      colors: {
        brand: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b1375',
        },
      },
    },
  },
  plugins: [],
}
