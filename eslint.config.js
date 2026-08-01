import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    /*
     * Build-time QA scripts run in Node and report through stdout.
     * They also contain page.evaluate() callbacks, whose bodies are
     * serialised and run inside the browser, so both global sets are
     * legitimately in scope here.
     */
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        // Browser globals, valid inside page.evaluate callbacks.
        window: "readonly",
        document: "readonly",
        getComputedStyle: "readonly",
        requestAnimationFrame: "readonly",
        setTimeout: "readonly",
        Event: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
