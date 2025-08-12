import { writeFileSync, unlinkSync, existsSync } from "fs";
import { resolve } from "path";
import { loadConfig } from ".";

jest.mock("./import-data-buffer", () => ({
  importDataBuffer: jest.fn(async () => ({
    default: { rules: [{ match: ["src/**"], goodfellas: ["sonny"] }] },
  })),
}));

const tsConfigPath = resolve(process.cwd(), "codefather.ts");
const jsonConfigPath = resolve(process.cwd(), "codefather.json");

describe("loadConfig", () => {
  afterEach(() => {
    if (existsSync(tsConfigPath)) unlinkSync(tsConfigPath);
    if (existsSync(jsonConfigPath)) unlinkSync(jsonConfigPath);
  });
  test("returns config when codefather.ts exists", async () => {
    writeFileSync(
      tsConfigPath,
      `export default {
        rules: [{ match: ["src/**"], goodfellas: ["sonny"] }]
      };`
    );
    const result = await loadConfig();
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
    expect(result?.rules?.[0]?.goodfellas).toEqual(["sonny"]);
  });
  test("throws an error if codefather.json is not properly formatted", async () => {
    writeFileSync(
      jsonConfigPath,
      `{ rules: { match: ["src/**"] goodfellas: ["sonny"] }] }`
    );
    await expect(loadConfig()).rejects.toThrow(
      "Your codefather.json file is invalid. You gotta respect the rules if you want my help."
    );
  });
  test("throws an error when no codefather.(ts|json) exists", async () => {
    await expect(loadConfig()).rejects.toThrow(
      "𐄂 The codefather.ts file doesn't exist. Maybe someone whacked it?"
    );
  });
});
