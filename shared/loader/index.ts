import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { getRandomMessage } from "@shared/messages";
import { MessageType, type CodefatherConfig } from "@shared/models";
import { safeJSONParse } from "@shared/parser";

export async function loadConfig(): Promise<CodefatherConfig> {
  try {
    const root = process.cwd();

    const tsPath = path.resolve(root, "codefather.ts");
    const jsonPath = path.resolve(root, "codefather.json");

    if (fs.existsSync(tsPath)) {
      const { register } = await import("tsx/esm/api");
      register();
      const config = await import(pathToFileURL(tsPath).href);
      // a typescript file import may have several 'default' levels depending on the environment
      return config?.default?.default || config?.default || config;
    }

    if (fs.existsSync(jsonPath)) {
      const config = fs.readFileSync(jsonPath, "utf-8");
      return safeJSONParse<CodefatherConfig>(config);
    }
    throw new Error(getRandomMessage(MessageType.NotFound));
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
}
