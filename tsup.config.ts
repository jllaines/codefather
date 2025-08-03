import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "cli/index.ts",
      "scripts/init": "scripts/init/index.ts",
      "scripts/github": "scripts/github/index.ts",
    },
    format: ["cjs", "esm"],
    dts: {
      entry: ["cli/index.ts"],
      resolve: true,
    },
    splitting: true,
    clean: true,
    treeshake: true,
    shims: true,
    minify: true,
    platform: "node",
    name: "MAIN",
    external: ["tsx"],
  },
]);
