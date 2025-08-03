#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { colorsMap } from "@shared/models";
import { safeJSONParse } from "@shared/parser";

const args = process.argv.slice(2);
const useJson = args.includes("--json");

export function runInit() {
  const rootDir = process.cwd();
  const configPath = path.join(
    rootDir,
    useJson ? "codefather.json" : "codefather.ts"
  );
  const pkgPath = path.join(rootDir, "package.json");

  if (!fs.existsSync(configPath)) {
    if (useJson) {
      fs.writeFileSync(configPath, JSON.stringify({ rules: [] }, null, 2));
    } else {
      fs.writeFileSync(
        configPath,
        `import type { CodefatherConfig } from "@donedeal0/codefather";\n\n` +
          `export default { rules: [] } satisfies CodefatherConfig;\n`
      );
    }
    console.log(
      colorsMap.info,
      `- A ${path.basename(configPath)} config file has been created.`
    );
  } else {
    console.log(
      colorsMap.info,
      `- A ${path.basename(configPath)} file already exists.`
    );
  }

  if (fs.existsSync(pkgPath)) {
    const pkg = safeJSONParse<{
      scripts?: Record<string, string>;
    }>(fs.readFileSync(pkgPath, "utf-8"));

    pkg.scripts = pkg.scripts || {};
    if (!pkg.scripts.codefather) {
      pkg.scripts.codefather = "codefather";
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log(
        colorsMap.info,
        "- A codefather script has been added to your package.json."
      );
    } else {
      console.log(
        colorsMap.info,
        "- A codefather script already exists in your package.json."
      );
    }
  } else {
    return console.log(
      colorsMap.error,
      "⚠️ No package.json found in the project root. Skipping script setup."
    );
  }

  return console.log(
    colorsMap.success,
    "\n✓ Setup complete. Run `npm run codefather` to enforce your rules."
  );
}

if (import.meta.url === new URL(import.meta.url).href) {
  runInit();
}
