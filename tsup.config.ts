import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "cli/index.ts",
      "scripts/init": "scripts/init/index.ts",
      "scripts/github": "scripts/github/index.ts",
    },
    dts: {
      entry: ["shared/models/index.ts"],
      resolve: true,
    },
    format: ["esm"],
    splitting: false,
    clean: true,
    treeshake: true,
    shims: true,
    minify: true,
    platform: "node",
    name: "CLI",
    external: ["esbuild"],
    outExtension: () => ({ js: ".mjs" }),
  },
]);
