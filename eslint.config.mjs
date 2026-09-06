import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import importPlugin from "eslint-plugin-import";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import pluginNext from "@next/eslint-plugin-next";

/**
 * Shared ESLint base config
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      turbo: turboPlugin,
      import: importPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",

      // Import order
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            orderImportKind: "asc",
          },
          groups: ["builtin", "external", "index", "internal", "sibling", "parent", "object", "type"],
        },
      ],

      // Type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: false,
        },
      ],

      "import/no-duplicates": [
        "error",
        {
          "prefer-inline": true,
        },
      ],

      // TypeScript rules
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowBoolean: true,
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/return-await": ["error", "in-try-catch"],

      // Disabled rules
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/require-await": "off",
      "import/namespace": "off",
      "no-empty-pattern": "off",

      // Import rules
      "import/no-mutable-exports": "error",
      "import/no-cycle": "off",
      "import/no-default-export": "error",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",

      // Next.js specific
      "no-restricted-imports": [
        "error",
        {
          name: "next/router",
          message: "Please use next/navigation instead.",
        },
      ],
    },
  },
  {
    // Allow default exports for Next.js special files
    files: [
      "app/**/{page,layout,loading,route,error,not-found}.ts?(x)",
      "src/app/**/{page,layout,loading,route,error,not-found}.ts?(x)",
      "**/tailwind.config.ts",
      "**/next.config.ts",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    // Allow default exports for Payload config files
    files: ["src/payload.config.ts", "playwright.config.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    ignores: [
      "**/*.js",
      "**/*.mjs",
      "**/*.jsx",
      "src/app/(payload)/**/*",
      "src/payload-types.ts",
      "dist/**",
      ".next/**",
      "next-env.d.ts",
      "node_modules/**",
      ".turbo/**",
      "eslint.config.js",
      "eslint.config.mjs",
      "eslint.config.cjs",
    ],
  },
];

export default config;
