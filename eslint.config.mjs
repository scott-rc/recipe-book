import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import "eslint-plugin-only-warn";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  {
    ignores: [".gadget/**", ".react-router/**", "./web/components/ui/**"],
  },
  eslint.configs.recommended,
  typescriptEslint.configs.strictTypeChecked,
  typescriptEslint.configs.stylisticTypeChecked,
  // @ts-expect-error eslint-plugin-react-refresh is not typed
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  // @ts-expect-error eslint-plugin-react-hooks is not typed correctly
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  reactHooksPlugin.configs.flat["recommended-latest"],
  prettier,
  {
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
      "import/resolver": {
        node: true,
        typescript: true,
      },
    },
    rules: {
      "@typescript-eslint/no-confusing-void-expression": ["warn", { ignoreVoidReturningFunctions: true, ignoreArrowShorthand: true }],
      "@typescript-eslint/no-misused-promises": ["warn", { checksVoidReturn: false }],
      "@typescript-eslint/prefer-nullish-coalescing": ["warn", { ignorePrimitives: { string: true } }],
      "@typescript-eslint/restrict-template-expressions": ["warn", { allowNumber: true }],
    },
  },
);
