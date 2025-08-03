import { execSync } from "child_process";
import { resolve } from "path";
import { getModifiedFiles } from ".";

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

describe("getModifiedFiles", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns merged and deduplicated modified files", async () => {
    (execSync as jest.Mock)
      .mockReturnValueOnce("src/a.ts\nsrc/b.ts") // unstaged
      .mockReturnValueOnce("src/b.ts\nsrc/c.ts") // staged
      .mockReturnValueOnce("src/new.ts") // created
      .mockReturnValueOnce("src/deleted.ts"); // deleted

    const result = await getModifiedFiles();

    expect(result).toStrictEqual([
      resolve("src/a.ts"),
      resolve("src/b.ts"),
      resolve("src/c.ts"),
      resolve("src/new.ts"),
      resolve("src/deleted.ts"),
    ]);
  });

  test("returns an empty array if git commands fail", async () => {
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error("git error");
    });
    const result = await getModifiedFiles();
    expect(result).toEqual([]);
  });
});
