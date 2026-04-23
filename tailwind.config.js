/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f49bd',
        'background-light': '#f6f6f8',
        'background-dark': '#101622',
        'foreground-light': '#111827',
        'foreground-dark': '#e5e7eb',
        'card-light': '#ffffff',
        'card-dark': '#1f2937',
        'border-light': '#e5e7eb',
        'border-dark': '#374151',
        'muted-light': '#6b7280',
        'muted-dark': '#9ca3af',
        'accent-gold': '#c99c33',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
