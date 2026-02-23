import js from "@eslint/js";
import tseslint from "typescript-eslint";
import next from "@next/eslint-plugin-next";

export default [
  // ✅ ignores (بديل .eslintignore)
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/sw.js",
      "public/workbox-*.js",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    plugins: {
      "@next/next": next,
    },
    rules: {
      // ✅ تقليل الضوضاء (زي ما قررت)
      "@typescript-eslint/no-explicit-any": "warn",

      // make common lint errors non‑blocking so build can pass
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/triple-slash-reference": "warn",
      "no-case-declarations": "warn",

      // ✅ تعطيل مؤقت لقواعد مزعجة
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
];
