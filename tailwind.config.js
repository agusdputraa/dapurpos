/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',    // Small phones
        'sm': '640px',    // Large phones/Small tablets
        'md': '768px',    // Tablets
        'lg': '1024px',   // Small laptops
        'xl': '1280px',   // Large laptops
        '2xl': '1536px',  // Desktop monitors
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'screen-dynamic': ['100vh', '100dvh'],
      },
      maxWidth: {
        'screen-safe': 'calc(100vw - env(safe-area-inset-left) - env(safe-area-inset-right))',
      },
      fontSize: {
        'mobile': ['0.875rem', { lineHeight: '1.25rem' }], // New mobile-specific font size
        'mobile-lg': ['1rem', { lineHeight: '1.5rem' }],   // New larger mobile font size
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      zIndex: {
        'modal': 50,
        'overlay': 40,
        'dropdown': 30,
        'header': 20,
        'fab': 10,
      },
    },
  },
  plugins: [],
};