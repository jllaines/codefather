#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { CodefatherConfig, colorsMap, CrewName } from "@shared/models";
import { safeJSONParse } from "@shared/parser";
import { generateConfigFromCodeowners } from "./generate-from-codeowner";

function informFileCreated(
  configPath: string,
  isCodeownersBased: boolean,
  crews: CrewName[],
  canOverwrite: boolean
) {
  if (canOverwrite) {
    console.log(
      colorsMap.info,
      `- A new ${configPath} config file has been created, your former config was overwritten.`
    );
  } else {
    console.log(
      colorsMap.info,
      `- A ${configPath} config file has been created.`
    );
  }
  if (isCodeownersBased) {
    console.log(
      colorsMap.info,
      `- The rules were filled with your CODEOWNER file.`
    );
    if (crews?.length > 0) {
      console.log(
        colorsMap.warning,
        `- The following crews were detected:\n${crews
          .map((crew) => `   - ${crew}`)
          .join("\n")}
\n⚙️ Please specify their members in the codefather config for CLI enforcement.\n`
      );
    }
  }
}

export async function runInit() {
  try {
    const args = process.argv.slice(2);
    const useJson = args.includes("json");
    const canOverwrite = args.includes("overwrite");
    const rootDir = process.cwd();
    const codeownersPath = path.join(rootDir, "./.github/CODEOWNERS");
    let baseConfig: CodefatherConfig = { rules: [] };
    let isCodeownersBased = false;
    const crews: CrewName[] = [];
    if (fs.existsSync(codeownersPath)) {
      const data = await generateConfigFromCodeowners(codeownersPath);
      baseConfig = data.config;
      isCodeownersBased = true;
      crews.push(...data.crews);
    }
    const configPath = path.join(
      rootDir,
      useJson ? "codefather.json" : "codefather.ts"
    );
    const pkgPath = path.join(rootDir, "package.json");
    const config = JSON.stringify(baseConfig, null, 2);
    if (!fs.existsSync(configPath) || canOverwrite) {
      if (useJson) {
        fs.writeFileSync(configPath, config);
      } else {
        fs.writeFileSync(
          configPath,
          `import type { CodefatherConfig } from "@donedeal0/codefather";\n\n` +
            `export default ${config} satisfies CodefatherConfig;\n`
        );
      }
      informFileCreated(
        path.basename(configPath),
        isCodeownersBased,
        crews,
        canOverwrite
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
        "⚠ No package.json found in the project root. Skipping script setup."
      );
    }

    return console.log(
      colorsMap.success,
      "\n✓ Setup complete. Run `npm run codefather` to enforce your rules."
    );
  } catch (err: unknown) {
    return console.log(
      colorsMap.error,
      err instanceof Error ? err.message : String(err)
    );
  }
}

if (import.meta.url === new URL(import.meta.url).href) {
  runInit();
}
