const colors = require('tailwindcss/colors');
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  purge: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  important: true,
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        gray: colors.coolGray,
        inherit: 'inherit'
      },
      transitionProperty: {
        backgroundColor: 'backgroundColor',
      },
      height: {
        'screen-35': '35vh',
      },
      minHeight: {
        14: '3.5rem',
        36: '9rem',
      },
      minWidth: {
        sm: '24rem',
        sidebar: '28rem',
        '1/5': '20%',
      },
      maxWidth: {
        '60-ch': '60ch',
        '1/4': '25%',
      },
      translate: {
        'screen-1/4': '25%',
      },
      transitionDuration: {
        325: '325ms',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        'serif-display': ['Playfair Display', ...fontFamily.serif],
      },
      fontSize: {
        xxs: '.625rem',
      },
      spacing: {
        '2px': '2px',
      },
      strokeWidth: {
        '1.5': '1.5',
        '2.5': '2.5',
      },
      zIndex: {
        '-1': -1,
      },
      lineClamp: {
        10: 10,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
};
