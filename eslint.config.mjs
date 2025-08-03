import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,ts}"] },
  { ignores: ["dist", "jest.config.js", ".commitlintrc.ts"] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];