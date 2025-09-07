/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.{html,js}',       // Escaneia arquivos na pasta raiz
    './src/**/*.{html,js}' // Escaneia arquivos dentro da pasta src
  ],
}