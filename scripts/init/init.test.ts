import fs from "fs";
import { resolve } from "path";
import { colorsMap } from "@shared/models";
import { runInit } from ".";

jest.mock("fs");
const originalArgv = process.argv;

describe("codefather init script", () => {
  const mockConsole = jest.spyOn(console, "log").mockImplementation(() => {});
  (fs.existsSync as jest.Mock).mockImplementation(() => true);
  const configPath = resolve("project", "codefather.ts");
  const pkgPath = resolve("project", "package.json");

  beforeEach(() => {
    jest.clearAllMocks();
    process.argv = ["node", "init.js"]; // no --json flag by default
    jest.spyOn(process, "cwd").mockReturnValue(resolve("project"));
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  test("creates codefather.ts if it does not exist", () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (p: string) => p === pkgPath
    );
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: {} }, null, 2)
    );

    runInit();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      configPath,
      expect.stringContaining("import type { CodefatherConfig }")
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      configPath,
      expect.stringContaining("export default")
    );

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather.ts config file has been created."
    );
  });

  test("does not create codefather.ts if it already exists", () => {
    (fs.existsSync as jest.Mock).mockImplementation(() => true);

    runInit();

    expect(fs.writeFileSync).not.toHaveBeenCalledWith(
      configPath,
      expect.anything()
    );
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather.ts file already exists."
    );
  });

  test("adds script to package.json if missing", () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (p: string) => p !== configPath
    );
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: {} }, null, 2)
    );

    runInit();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      pkgPath,
      expect.stringContaining('"codefather": "codefather"')
    );
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather script has been added to your package.json."
    );
  });

  test("skips adding script if already present", () => {
    (fs.existsSync as jest.Mock).mockImplementation(() => true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: { codefather: "codefather" } }, null, 2)
    );

    runInit();

    expect(fs.writeFileSync).not.toHaveBeenCalledWith(
      pkgPath,
      expect.anything()
    );
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather script already exists in your package.json."
    );
  });

  test("return an error if package.json is missing", () => {
    (fs.existsSync as jest.Mock).mockImplementation(() => false);

    runInit();

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.error,
      "⚠️ No package.json found in the project root. Skipping script setup."
    );
    expect(mockConsole).not.toHaveBeenCalledWith(
      colorsMap.success,
      "\n✓ Setup complete. Run `npm run codefather` to enforce your rules."
    );
  });

  test("logs final setup confirmation", () => {
    (fs.existsSync as jest.Mock).mockImplementation(() => true);

    runInit();

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.success,
      "\n✓ Setup complete. Run `npm run codefather` to enforce your rules."
    );
  });
});
