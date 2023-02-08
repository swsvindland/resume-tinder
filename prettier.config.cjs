/** @type {import("prettier").Config} */
module.exports = {
  tabWidth: 4,
  semi: true,
  singleQuote: true,
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
};
