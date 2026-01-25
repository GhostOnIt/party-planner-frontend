/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Les couleurs principales sont maintenant définies dans CSS via @theme inline
      // On garde seulement les couleurs personnalisées spécifiques à l'application
      colors: {
        success: {
          DEFAULT: '#22c55e',
          foreground: '#ffffff'
        },
        warning: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff'
        },
        error: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff'
        },
        info: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff'
        },
        priority: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444'
        },
        event: {
          mariage: '#ec4899',
          anniversaire: '#8b5cf6',
          'baby-shower': '#3b82f6',
          soiree: '#eab308',
          brunch: '#f97316',
          autre: '#6b7280'
        }
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
