import fs from "fs";
import { dirname, resolve } from "path";

export function resolveConfigPath(): string {
  const root = process.cwd();
  const jsonPath = resolve(root, "codefather.json");
  const tsPath = resolve(root, "codefather.ts");
  if (fs.existsSync(tsPath)) {
    return dirname(tsPath);
  }
  if (fs.existsSync(jsonPath)) {
    return dirname(jsonPath);
  }
  return root;
}
