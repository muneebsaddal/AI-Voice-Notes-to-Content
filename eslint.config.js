const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: [
      ".agents/**",
      ".expo/**",
      ".superpowers/**",
      "backend/dist/**",
      "dist/**",
      "node_modules/**",
      "pytest-cache-files-*/**",
      "services/**/.venv/**",
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
