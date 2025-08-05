import fs from "fs";
import { resolve } from "path";
import { colorsMap } from "@shared/models";
import { generateConfigFromCodeowners } from "./generate-from-codeowner";
import { runInit } from ".";

jest.mock("fs");
jest.mock("./generate-from-codeowner");
const originalArgv = process.argv;

describe("codefather init script", () => {
  const mockConsole = jest.spyOn(console, "log").mockImplementation(() => {});
  (fs.existsSync as jest.Mock).mockImplementation(() => true);
  const configPath = resolve("project", "codefather.ts");
  const jsonConfigPath = resolve("project", "codefather.json");
  const pkgPath = resolve("project", "package.json");
  const codeownersPath = resolve("project", "./.github/CODEOWNERS");

  beforeEach(() => {
    jest.clearAllMocks();
    process.argv = ["node", "init.js"]; // no flags by default
    jest.spyOn(process, "cwd").mockReturnValue(resolve("project"));
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  test("creates codefather.ts if it does not exist", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (p: string) => p === pkgPath
    );
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: {} }, null, 2)
    );

    await runInit();

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

  test("creates codefather.ts from codeowners if codeowners exists", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (p: string) => p !== configPath
    );
    (generateConfigFromCodeowners as jest.Mock).mockImplementation(() => ({
      config: {
        rules: [
          { match: ["src/models/*"], goodfellas: ["@tomhagen", "solozzo"] },
        ],
      },
      crews: [],
    }));
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: {} }, null, 2)
    );

    await runInit();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      configPath,
      expect.stringContaining("import type { CodefatherConfig }")
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      configPath,
      expect.stringContaining("export default")
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      configPath,
      expect.stringContaining("solozzo")
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      configPath,
      expect.stringContaining("@tomhagen")
    );

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather.ts config file has been created."
    );
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- The rules were filled with your CODEOWNER file."
    );
    expect(mockConsole).not.toHaveBeenCalledWith(
      colorsMap.info,
      expect.stringContaining(`- The following crews were detected`)
    );
  });

  test("creates codefather.ts from codeowners if codeowners exists and warns about crews", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (p: string) => p !== configPath
    );
    (generateConfigFromCodeowners as jest.Mock).mockImplementation(() => ({
      config: {
        rules: [
          { match: ["src/models/*"], goodfellas: ["@tomhagen", "solozzo"] },
        ],
      },
      crews: ["clemenzaPeople"],
    }));
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: {} }, null, 2)
    );

    await runInit();

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
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- The rules were filled with your CODEOWNER file."
    );

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.warning,
      expect.stringContaining(`- The following crews were detected`)
    );
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.warning,
      expect.stringContaining(`clemenzaPeople`)
    );
  });

  test("creates codefather.json if it does not exist and the --json flag is provided", async () => {
    process.argv = ["node", "init.js", "--json"];
    (fs.existsSync as jest.Mock).mockImplementation(
      (p: string) => p === pkgPath
    );
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: {} }, null, 2)
    );

    await runInit();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      jsonConfigPath,
      expect.not.stringContaining("import type { CodefatherConfig }")
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      jsonConfigPath,
      expect.not.stringContaining("export default")
    );

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather.json config file has been created."
    );
  });

  test("does not create codefather.ts if it already exists", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (file) => file === configPath
    );

    await runInit();

    expect(fs.writeFileSync).not.toHaveBeenCalledWith(
      configPath,
      expect.anything()
    );
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather.ts file already exists."
    );
  });

  test("overwrites an existing codefather config the --overwrite flag is provided", async () => {
    process.argv = ["node", "init.js", "--overwrite"];
    (fs.existsSync as jest.Mock).mockImplementation(() => true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: {} }, null, 2)
    );

    await runInit();

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A new codefather.ts config file has been created, your former config was overwritten."
    );
  });

  test("adds script to package.json if missing", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (file: string) => file === pkgPath
    );
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: {} }, null, 2)
    );

    await runInit();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      pkgPath,
      expect.stringContaining('"codefather": "codefather"')
    );
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather script has been added to your package.json."
    );
  });

  test("skips adding script if already present", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (file) => file !== codeownersPath
    );
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ scripts: { codefather: "codefather" } }, null, 2)
    );

    await runInit();

    expect(fs.writeFileSync).not.toHaveBeenCalledWith(
      pkgPath,
      expect.anything()
    );
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.info,
      "- A codefather script already exists in your package.json."
    );
  });

  test("return an error if package.json is missing", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(() => false);

    await runInit();

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.error,
      "⚠ No package.json found in the project root. Skipping script setup."
    );
    expect(mockConsole).not.toHaveBeenCalledWith(
      colorsMap.success,
      "\n✓ Setup complete. Run `npm run codefather` to enforce your rules."
    );
  });

  it("return an error if the codeowner file is invalid", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(
      (file) => file === codeownersPath
    );
    (generateConfigFromCodeowners as jest.Mock).mockImplementationOnce(() => {
      throw new Error("𐄂 Your CODEOWNER file is invalid.");
    });
    await runInit();
    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.error,
      "𐄂 Your CODEOWNER file is invalid."
    );
  });

  test("logs final setup confirmation", async () => {
    (fs.existsSync as jest.Mock).mockImplementation(() => true);
    (generateConfigFromCodeowners as jest.Mock).mockImplementation(() => ({
      config: { rules: [] },
      crews: [],
    }));
    await runInit();

    expect(mockConsole).toHaveBeenCalledWith(
      colorsMap.success,
      "\n✓ Setup complete. Run `npm run codefather` to enforce your rules."
    );
  });
});
