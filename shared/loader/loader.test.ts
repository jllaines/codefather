import { writeFileSync, unlinkSync } from "fs";
import { resolve } from "path";
import { loadConfig } from ".";

const tsConfigPath = resolve(process.cwd(), "codefather.ts");
const jsonConfigPath = resolve(process.cwd(), "codefather.json");

describe("loadConfig", () => {
  test("returns config when codefather.ts exists", async () => {
    writeFileSync(
      tsConfigPath,
      `export default {
        rules: [{ match: ["src/**"], goodfellas: ["sonny"] }]
      };`
    );
    const result = await loadConfig();
    unlinkSync(tsConfigPath);
    expect(result?.rules?.[0]?.goodfellas).toEqual(["sonny"]);
  });
  test("returns config when codefather.json exists", async () => {
    writeFileSync(
      jsonConfigPath,
      JSON.stringify({
        rules: [{ match: ["src/**"], goodfellas: ["sonny"] }],
      })
    );
    const result = await loadConfig();
    unlinkSync(jsonConfigPath);
    expect(result?.rules?.[0]?.goodfellas).toEqual(["sonny"]);
  });
  test("throws an error if codefather.json is not properly formatted", async () => {
    writeFileSync(
      jsonConfigPath,
      `{ rules: { match: ["src/**"] goodfellas: ["sonny"] }] }`
    );
    try {
      await loadConfig();
    } catch (err) {
      unlinkSync(jsonConfigPath);
      expect(err instanceof Error ? err.message : err).toBe(
        "Your JSON file is invalid. You gotta respect the rules if you want my help."
      );
    }
  });
  test("throws an error when no codefather.(ts|json) exists", async () => {
    try {
      await loadConfig();
    } catch (err) {
      expect(err instanceof Error ? err.message : err).toBe(
        "𐄂 The codefather.ts file doesn't exist. Maybe someone whacked it?"
      );
    }
  });
});
