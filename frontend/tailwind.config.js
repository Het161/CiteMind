/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter',  'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter',         'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        ink:    '#0a0d14',
        panel:  '#111827',
        panel2: '#1a2235',
        edge:   '#232d42',
        neon:   '#00ffcc',
        teal: {
          DEFAULT: '#2dd4bf',
          dim:     '#0f766e',
        },
        grape: {
          DEFAULT: '#a78bfa',
          dim:     '#6d28d9',
        },
        amber: {
          DEFAULT: '#fbbf24',
        },
        rose: {
          DEFAULT: '#fb7185',
        },
      },
      boxShadow: {
        glow:      '0 0 0 1px rgba(45,212,191,0.3), 0 0 24px rgba(45,212,191,0.18), 0 8px 32px rgba(0,0,0,0.5)',
        'glow-lg': '0 0 0 1px rgba(45,212,191,0.4), 0 0 40px rgba(45,212,191,0.25), 0 12px 48px rgba(0,0,0,0.6)',
        grape:     '0 0 0 1px rgba(167,139,250,0.3), 0 0 24px rgba(167,139,250,0.18), 0 8px 32px rgba(0,0,0,0.5)',
        rose:      '0 0 0 1px rgba(251,113,133,0.25), 0 0 20px rgba(251,113,133,0.15), 0 8px 32px rgba(0,0,0,0.5)',
        neon:      '0 0 0 1px rgba(0,255,204,0.3), 0 0 40px rgba(0,255,204,0.2), 0 8px 40px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-teal-grape': 'linear-gradient(135deg, #2dd4bf 0%, #a78bfa 100%)',
        'gradient-dark':       'linear-gradient(180deg, #0a0d14 0%, #111827 100%)',
      },
      animation: {
        'gradient-shift': 'gradientShift 4s linear infinite',
        'float':          'float 4s ease-in-out infinite',
        'pulse-glow':     'pulseGlow 3s ease-in-out infinite',
        'orbital':        'orbitalSpin 20s linear infinite',
        'fade-in-up':     'fadeSlideUp 0.6s ease forwards',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};
