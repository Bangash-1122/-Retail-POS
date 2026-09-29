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
        // User's custom palette
        pos: {
          bg: '#0A1214',         // Deep obsidian background
          surface: '#32383B',    // Card, panel, container surface
          card: '#162226',       // Intermediate dark card tone
          border: '#32383B',     // Border tone
          muted: '#B2BEC2',      // Muted / secondary text & icon tone
          hover: '#CBD3D6',      // Primary hover highlight color
          light: '#EDF1F2',      // Crisp light primary text
        },
        brand: {
          50: '#EDF1F2',
          100: '#CBD3D6',
          200: '#B2BEC2',
          300: '#8A979B',
          400: '#606C70',
          500: '#434B4F',
          600: '#32383B',
          700: '#23292C',
          800: '#171E20',
          900: '#0F1618',
          950: '#0A1214',
        },
        posDark: {
          bg: '#0A1214',
          card: '#32383B',
          surface: '#32383B',
          border: '#32383B',
          input: '#0A1214',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 25px -4px rgba(203, 211, 214, 0.25)',
        glowEmerald: '0 0 25px -4px rgba(203, 211, 214, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}