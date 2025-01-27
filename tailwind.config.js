/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        title:["Cantarella","sans-serif"],
        subheading:["Exo","serif"],
        body:["Nunito Sans","serif"],
      },
      colors:{
        'blaze-orange': {
          '50': '#fff6ed',
          '100': '#ffebd5',
          '200': '#fed4aa',
          '300': '#fdb574',
          '400': '#fb8a3c',
          '500': '#f96a16',
          '600': '#ea4f0c',
          '700': '#c23a0c',
          '800': '#9a2f12',
          '900': '#7c2912',
          '950': '#431207',
        },
      },
      backgroundImage: {
        'custom-gradient': 'radial-gradient(at 8.89% 90.70%, #c23a0c 0%, transparent 80%), radial-gradient(at 85.44% 15.37%, #ea4f0c 0%, transparent 64%)',
      },
    },
  },
  plugins: [],
}

