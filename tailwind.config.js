/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0b10',
          card: '#121420',
          border: '#1f2438',
          hover: '#1a1d2e'
        },
        brand: {
          cyan: '#00f2fe',
          purple: '#7f00ff',
          pink: '#f107a3',
          blue: '#4facfe'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(0, 242, 254, 0.6))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(127, 0, 255, 0.9))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
