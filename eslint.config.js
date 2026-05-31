const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: [
      ".agents/**",
      ".expo/**",
      ".superpowers/**",
      "dist/**",
      "node_modules/**",
      "tmp/**",
    ],
  },
  {
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
