/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: [
    './src/public/**/*.html',
    './src/**/*.js',
    './src/**/*.ejs', // Include EJS files here if you are using EJS templates
  ],
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
        'primary': '#FFAD03', // Example custom color
        'secondary': '#1B1B1B', // Example custom color
        'third': '#fffff2'
      }
    },
  },
  plugins: [],
};
