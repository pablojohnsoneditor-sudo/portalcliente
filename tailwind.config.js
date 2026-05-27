/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:     '#080808',
        card:    '#0F0F0F',
        border:  '#1C1C1C',
        snow:    '#ECECEC',
        muted:   '#C2C2C2',
        lime:    '#C6FF00',
        'lime-dk': '#B4F000',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
