import fs from "fs";
import { generateConfigFromCodeowners } from ".";

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe("generateConfigFromCodeowners", () => {
  it("return a codefather config from a codeowner file", async () => {
    (fs.promises.readFile as jest.Mock).mockReturnValue(`
  # Github doc about CODEOWNERS is available at https://docs.github.com

# Each line is a file pattern followed by one or more owners.

# App leads

turbo.json @corleone/clemenzaPeople
/.github/ @corleone/clemenzaPeople
**/package.json @corleone/clemenzaPeople
tsconfig.json @corleone/tessioTeam

# Application owners

/apps/gambling/ @corleone/clemenzaPeople @tomhagen @mike
/apps/protection @tomhagen @oldblueeyes`);

    const { config, crews } =
      await generateConfigFromCodeowners("codeowners-path");
    expect(config).toStrictEqual({
      codeReviews: {
        autoAssignGoodfellas: true,
      },
      crews: {
        "@corleone/clemenzaPeople": [],
        "@corleone/tessioTeam": [],
      },
      rules: [
        {
          match: ["turbo.json", "/.github/", "**/package.json"],
          goodfellas: [],
          crews: ["@corleone/clemenzaPeople"],
        },
        {
          match: ["tsconfig.json"],
          goodfellas: [],
          crews: ["@corleone/tessioTeam"],
        },
        {
          match: ["/apps/gambling/"],
          goodfellas: [{ name: "@mike" }, { name: "@tomhagen" }],
          crews: ["@corleone/clemenzaPeople"],
        },
        {
          match: ["/apps/protection"],
          goodfellas: [{ name: "@oldblueeyes" }, { name: "@tomhagen" }],
        },
      ],
    });
    expect(crews).toStrictEqual([
      "@corleone/clemenzaPeople",
      "@corleone/tessioTeam",
    ]);
  });
  it("return a codefather config from a codeowner file without crews", async () => {
    (fs.promises.readFile as jest.Mock).mockReturnValue(`
  # Github doc about CODEOWNERS is available at https://docs.github.com

# Each line is a file pattern followed by one or more owners.

# Application owners

/apps/gambling/ @tomhagen @mike
/apps/protection @tomhagen @oldblueeyes`);

    const { config, crews } =
      await generateConfigFromCodeowners("codeowners-path");
    expect(config).toStrictEqual({
      codeReviews: {
        autoAssignGoodfellas: true,
      },
      rules: [
        {
          match: ["/apps/gambling/"],
          goodfellas: [{ name: "@mike" }, { name: "@tomhagen" }],
        },
        {
          match: ["/apps/protection"],
          goodfellas: [{ name: "@oldblueeyes" }, { name: "@tomhagen" }],
        },
      ],
      crews: {},
    });
    expect(crews).toStrictEqual([]);
  });
  it("return a codefather config from an empty codeowner file", async () => {
    (fs.promises.readFile as jest.Mock).mockReturnValue("");

    const { config, crews } =
      await generateConfigFromCodeowners("codeowners-path");
    expect(config).toStrictEqual({
      codeReviews: {
        autoAssignGoodfellas: true,
      },
      rules: [],
      crews: {},
    });
    expect(crews).toStrictEqual([]);
  });
  it("throws if the codeowner file is invalid", async () => {
    (fs.promises.readFile as jest.Mock).mockImplementationOnce(() => {
      throw new Error("𐄂 Your CODEOWNER file is invalid.");
    });

    await expect(
      generateConfigFromCodeowners("codeowners-path")
    ).rejects.toThrow("𐄂 Your CODEOWNER file is invalid.");
  });
});
