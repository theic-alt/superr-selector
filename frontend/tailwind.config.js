/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rr: {
          pink: '#EA1A88',
          pinkHover: '#FF2A9D',
          darkPink: '#A60E5E',
          royalBlue: '#004BA0',
          blue: '#0B2046',
          darkBlue: '#061024',
          navy: '#050B1A',
          gold: '#E5A93C',
          accent: '#FF3366',
        },
        pitch: {
          dark: '#050814',
          surface: '#091124',
          panel: '#0D1935',
          border: 'rgba(234, 26, 136, 0.18)',
          glow: 'rgba(234, 26, 136, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Rajdhani', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(234, 26, 136, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(234, 26, 136, 0.8), 0 0 10px rgba(229, 169, 60, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
