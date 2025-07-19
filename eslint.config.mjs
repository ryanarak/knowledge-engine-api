import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";

export default defineConfig([
  // ✅ Base config
  {
    files: ["**/*.{js,mjs,cjs}"],
    ignores: [
      "node_modules/**",
      ".vercel/**",
      "dist/**",
      "build/**",
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: { js },
    extends: [
      "eslint:recommended",
      prettier // integrates Prettier
    ],
    rules: {
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      "no-undef": "error",
      "no-console": "off",
      "no-debugger": "warn",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "no-trailing-spaces": "warn",
      "eol-last": ["error", "always"],
      "quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
      "semi": ["error", "always"],
    },
  },

  // 📂 Node-specific overrides
  {
    files: ["api/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-process-exit": "warn",
      "no-buffer-constructor": "error",
    },
  },
]);
