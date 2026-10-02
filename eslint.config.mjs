import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Uzbek prose contains apostrophes (oʻ/gʻ) in almost every sentence;
      // requiring &apos;/&quot; escaping throughout adds noise without value.
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Node build/data scripts legitimately use CommonJS require and Node globals.
    files: ["scripts/**", "**/*.cjs", "**/*.mjs", "prisma.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
