/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      
      spacing: {
        '22': '4.5rem', // Adding 5.6rem as a custom spacing value
      },
      colors: {
        greenyellow: '#ADFF2F',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(0)' },
  },
      
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'slide-down': 'slide-down 0.5s ease-out forwards',
        'spin-slow':'spin 2s linear infinite',
      },
      
    },
  },
  plugins: [],
}

