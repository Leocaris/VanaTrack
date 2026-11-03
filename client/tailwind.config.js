
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#1b4332',
          950: '#081c15',
        },

        sage: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#cddbcd',
          300: '#a7c2a7',
          400: '#7fa37f',
          500: '#52b788',
          600: '#439770',
          700: '#357759',
          800: '#2b5f47',
          900: '#244e3b',
          950: '#112c20',
        },

        canvas: {
          bg: '#f8faf9',
          card: '#ffffff',
          subtle: '#f1f5f2',
          border: '#e2e8f0',

          // Dark mode palette
          'dark-bg': '#111318',
          'dark-sidebar': '#181c24',
          'dark-card': '#20252e',
          'dark-subtle': '#292f3a',
          'dark-border': '#343b46',
          'dark-text': '#f3f4f6',
          'dark-muted': '#9ca3af',
        },
      },

      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },

      boxShadow: {
        subtle:
          '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',

        card:
          '0 4px 6px -1px rgba(27, 67, 50, 0.04), 0 2px 4px -1px rgba(27, 67, 50, 0.02)',

        elevated:
          '0 10px 15px -3px rgba(27, 67, 50, 0.07), 0 4px 6px -2px rgba(27, 67, 50, 0.03)',

        'dark-card':
          '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
    },
  },

  plugins: [],
}
