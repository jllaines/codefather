import { getModifiedFiles } from "@cli/diff";
import { getLocalGitUser } from "@cli/git-user";
import { validateFiles } from "@shared/file-validator";
import { showDonAscii } from "@shared/ascii/don";
import { loadConfig } from "@shared/loader";
import { getRandomMessage } from "@shared/messages";
import { colorsMap } from "@shared/models";
import { enforceRules } from "@shared/rules-enforcer";
import { runCheck } from ".";

jest.mock("@cli/diff");
jest.mock("@cli/git-user");
jest.mock("@shared/ascii/don");
jest.mock("@shared/file-validator");
jest.mock("@shared/loader");
jest.mock("@shared/messages");
jest.mock("@shared/rules-enforcer");

describe("runCheck", () => {
  const mockLog = jest.spyOn(console, "log").mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("No config: log an error message", async () => {
    (loadConfig as jest.Mock).mockImplementation(() => {
      throw new Error("Config not found");
    });
    (getRandomMessage as jest.Mock).mockReturnValue("Config not found");
    await runCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.error, "Config not found");
  });

  test("No changes: log an info message and hide ascii if showAscii is false", async () => {
    (loadConfig as jest.Mock).mockResolvedValue({
      options: { showAscii: false },
    });
    (getModifiedFiles as jest.Mock).mockReturnValue([]);
    (getRandomMessage as jest.Mock).mockReturnValue("No changes");
    await runCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.info, "No changes");
    expect(showDonAscii).not.toHaveBeenCalled();
  });

  test("No changes: log an info message and show ascii if showAscii is true", async () => {
    (loadConfig as jest.Mock).mockResolvedValue({
      options: { showAscii: true },
    });
    (getModifiedFiles as jest.Mock).mockReturnValue([]);
    (getRandomMessage as jest.Mock).mockReturnValue("No changes");
    await runCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.info, "No changes");
    expect(showDonAscii).toHaveBeenCalledWith(colorsMap.info);
  });

  test("throws when no user is found", async () => {
    (getLocalGitUser as jest.Mock).mockImplementation(() => {
      throw new Error("No user found!");
    });
    (loadConfig as jest.Mock).mockResolvedValue({
      options: { showAscii: false },
    });
    (getModifiedFiles as jest.Mock).mockReturnValue(["src/core/index.ts"]);

    await runCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.error, "No user found!");
    expect(showDonAscii).not.toHaveBeenCalled();
  });

  test("No errors and warnings: log a success message and hide ascii if hideAscii is true", async () => {
    (getLocalGitUser as jest.Mock).mockReturnValue({ name: "sonny" });
    (loadConfig as jest.Mock).mockResolvedValue({
      options: { showAscii: false },
    });
    (getModifiedFiles as jest.Mock).mockReturnValue(["src/core/index.ts"]);
    (validateFiles as jest.Mock).mockReturnValue({
      errors: [],
      warnings: [],
    });
    (getRandomMessage as jest.Mock).mockReturnValue("All good!");

    await runCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.success, "All good!");
    expect(showDonAscii).not.toHaveBeenCalled();
  });

  test("No errors and warnings: log a success message and show ascii if hideAscii is false", async () => {
    (getLocalGitUser as jest.Mock).mockReturnValue({ name: "sonny" });
    (loadConfig as jest.Mock).mockResolvedValue({
      options: { showAscii: true },
    });
    (getModifiedFiles as jest.Mock).mockReturnValue(["src/core/index.ts"]);
    (validateFiles as jest.Mock).mockReturnValue({
      errors: [],
      warnings: [],
    });
    (getRandomMessage as jest.Mock).mockReturnValue("All good!");

    await runCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.success, "All good!");
    expect(showDonAscii).toHaveBeenCalledWith(colorsMap.success);
  });

  test("Errors: call enforceRules", async () => {
    const mockResults = {
      errors: ["Beware!"],
      warnings: [],
    };
    (getLocalGitUser as jest.Mock).mockReturnValue({ name: "sonny" });
    (loadConfig as jest.Mock).mockResolvedValue({});
    (getModifiedFiles as jest.Mock).mockReturnValue(["src/core/index.ts"]);
    (validateFiles as jest.Mock).mockReturnValue(mockResults);

    await runCheck();
    expect(enforceRules).toHaveBeenCalledWith(mockResults, true);
  });

  test("Warnings: call enforceRules", async () => {
    const mockResults = {
      errors: [],
      warnings: ["Last warning..."],
    };
    (getLocalGitUser as jest.Mock).mockReturnValue({ name: "sonny" });
    (loadConfig as jest.Mock).mockResolvedValue({});
    (getModifiedFiles as jest.Mock).mockReturnValue(["src/core/index.ts"]);
    (validateFiles as jest.Mock).mockReturnValue(mockResults);

    await runCheck();
    expect(enforceRules).toHaveBeenCalledWith(mockResults, true);
  });

  test("Errors and warnings: call enforceRules", async () => {
    const mockResults = {
      errors: ["Beware!"],
      warnings: ["Last warning..."],
    };
    (getLocalGitUser as jest.Mock).mockReturnValue({ name: "sonny" });
    (loadConfig as jest.Mock).mockResolvedValue({});
    (getModifiedFiles as jest.Mock).mockReturnValue([
      "src/core/index.ts",
      ".env",
    ]);
    (validateFiles as jest.Mock).mockReturnValue(mockResults);

    await runCheck();
    expect(enforceRules).toHaveBeenCalledWith(mockResults, true);
  });
});
