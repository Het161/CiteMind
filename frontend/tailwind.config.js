/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0d1117',
        panel: '#161b22',
        panel2: '#1c2230',
        edge: '#2a3140',
        teal: {
          DEFAULT: '#2dd4bf',
          dim: '#0f766e',
        },
        grape: {
          DEFAULT: '#a78bfa',
          dim: '#6d28d9',
        },
        amber: {
          DEFAULT: '#fbbf24',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45,212,191,0.25), 0 8px 30px rgba(0,0,0,0.4)',
        grape: '0 0 0 1px rgba(167,139,250,0.3), 0 8px 30px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
