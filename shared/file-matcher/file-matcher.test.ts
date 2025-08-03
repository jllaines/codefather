import { resolve, win32 } from "path";
import { matchFilesAgainstRule } from ".";

describe("matchFilesAgainstRule", () => {
  const root = resolve("project");
  const updatedFiles = [
    resolve("project/src/core/index.ts"),
    resolve("project/src/utils/helpers.ts"),
    resolve("project/config/dev.env"),
    resolve("project/.env"),
    resolve("project/src/models/searches/utils.ts"),
    resolve("project/docs/readme.md"),
  ];

  test("matches single glob string with recursive wildcard (**)", () => {
    const result = matchFilesAgainstRule(updatedFiles, ["src/core/**"], root);
    expect(result).toEqual([resolve("project/src/core/index.ts")]);
  });

  test("matches multiple globs including specific file and directory", () => {
    const result = matchFilesAgainstRule(
      updatedFiles,
      ["*.env", "config/**"],
      root
    );
    expect(result).toEqual([
      resolve("project/config/dev.env"),
      resolve("project/.env"),
    ]);
  });

  test("matches specific file path", () => {
    const result = matchFilesAgainstRule(
      updatedFiles,
      ["src/models/searches/utils.ts"],
      root
    );
    expect(result).toEqual([resolve("project/src/models/searches/utils.ts")]);
  });

  test("matches single-level wildcard (*)", () => {
    const result = matchFilesAgainstRule(
      updatedFiles,
      ["src/*/index.ts"],
      root
    );
    expect(result).toEqual([resolve("project/src/core/index.ts")]);
  });

  test("matches regex pattern", () => {
    const result = matchFilesAgainstRule(updatedFiles, [/.*\.env$/], root);
    expect(result).toEqual([
      resolve("project/config/dev.env"),
      resolve("project/.env"),
    ]);
  });

  test("returns empty array for no matches", () => {
    const result = matchFilesAgainstRule(
      updatedFiles,
      ["nonexistent/**"],
      root
    );
    expect(result).toEqual([]);
  });

  test("handles empty files array", () => {
    const result = matchFilesAgainstRule([], ["src/**"], root);
    expect(result).toEqual([]);
  });

  test("handles empty rulePattern array", () => {
    const result = matchFilesAgainstRule(updatedFiles, [], root);
    expect(result).toEqual([]);
  });

  test("handles Windows-style paths correctly", () => {
    const windowsRoot = win32.resolve("C:\\project");
    const winFiles = [
      win32.resolve("C:\\project\\src\\core\\index.ts"),
      win32.resolve("C:\\project\\config\\dev.env"),
    ];
    const result = matchFilesAgainstRule(
      winFiles,
      ["src/core/**"],
      windowsRoot
    );
    expect(result).toEqual([win32.resolve("C:\\project\\src\\core\\index.ts")]);
  });

  test("handles case-insensitive matching", () => {
    const result = matchFilesAgainstRule(
      updatedFiles,
      ["SRC/CORE/**"], // Uppercase pattern
      root
    );
    expect(result).toEqual([]); // Should not match due to case sensitivity
  });

  test("handles malformed glob pattern gracefully", () => {
    const result = matchFilesAgainstRule(updatedFiles, ["**/*[a-z"], root); // Malformed glob
    expect(result).toEqual([]); // Should not throw, just return no matches
  });
  test("can match files when run from a subdirectory", () => {
    const configRoot = resolve(__dirname, "../nested-monorepo-app");
    const file = resolve(configRoot, "src/utils/helpers.ts");
    const rule = { match: ["src/utils/**"] };

    const matched = matchFilesAgainstRule([file], rule.match, configRoot);
    expect(matched).toContain(file);
  });
});
