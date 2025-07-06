import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
// @ts-expect-error eslint-plugin-only-warn is not typed
import onlyWarn from "eslint-plugin-only-warn";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".gadget/**"],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  prettier,
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      "only-warn": onlyWarn,
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
      "import/resolver": {
        node: true,
        typescript: true,
      },
    },
    rules: {
      "@typescript-eslint/no-confusing-void-expression": ["warn", { ignoreVoidReturningFunctions: true }],
      "@typescript-eslint/no-misused-promises": ["warn", { checksVoidReturn: false }],
      "@typescript-eslint/prefer-nullish-coalescing": ["warn", { ignorePrimitives: { string: true } }],
      "@typescript-eslint/restrict-template-expressions": ["warn", { allowNumber: true }],
    },
  },
  {
    files: ["web/**/*.tsx", "web/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "@radix-ui/themes",
              importNames: ["Link"],
              message: "use Link from web/app/components/Link.tsx instead",
            },
            {
              name: "react-router-dom",
              importNames: ["Link"],
              message: "use Link from web/app/components/Link.tsx instead",
            },
          ],
        },
      ],
    },
  },
);
