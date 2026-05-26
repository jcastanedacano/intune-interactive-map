/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        edge: {
          data: '#06B6D4',
          signal: '#8B5CF6',
          policy: '#F97316',
          escalation: '#374151'
        }
      }
    }
  },
  plugins: []
}
