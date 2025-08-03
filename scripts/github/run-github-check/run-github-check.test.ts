/* eslint-disable @typescript-eslint/no-unused-vars */
import { showDonAscii } from "@shared/ascii/don";
import { validateFiles } from "@shared/file-validator";
import { loadConfig } from "@shared/loader";
import { getRandomMessage } from "@shared/messages";
import { colorsMap } from "@shared/models";
import { enforceRules } from "@shared/rules-enforcer";
import { Octokit } from "../octokit";
import { runGithubCheck } from "./index";

jest.mock("@shared/loader");
jest.mock("@shared/file-validator");
jest.mock("@shared/rules-enforcer");
jest.mock("@shared/ascii/don");
jest.mock("@shared/messages");
jest.mock("../octokit");

const defaultResults = { errors: [], warnings: [] };
const committers = [{ name: "solozzo" }];
const files = ["src/core/index.ts"];

describe("runGithubCheck", () => {
  const assignReviewersMock = jest.fn();
  const mockLog = jest.spyOn(console, "log").mockImplementation(() => {});
  const mockExit = jest
    .spyOn(process, "exit")
    .mockImplementation((code) => code as never);
  (Octokit.init as jest.Mock).mockReturnValue({
    getPullRequestID: () => 1972,
    getCommitters: async () => committers,
    getModifiedFiles: async () => files,
    assignReviewers: assignReviewersMock,
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("exits if not running in a GitHub CI environment", async () => {
    delete process.env.CI;
    delete process.env.GITHUB_ACTIONS;
    try {
      await runGithubCheck();
    } catch (_) {
      expect(mockLog).toHaveBeenCalledWith(
        colorsMap.error,
        "𐄂 This script is intended to run inside GitHub Actions."
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    }
  });

  test("exits if GITHUB_TOKEN is missing", async () => {
    process.env.CI = "true";
    delete process.env.GITHUB_TOKEN;
    try {
      await runGithubCheck();
    } catch (_) {
      expect(mockLog).toHaveBeenCalledWith(
        colorsMap.error,
        "𐄂 GITHUB_TOKEN is missing. Make sure it's passed via `env:` in your workflow."
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    }
  });

  test("successfully exits when no errors or warnings", async () => {
    process.env.CI = "true";
    process.env.GITHUB_TOKEN = "token";
    (loadConfig as jest.Mock).mockResolvedValue({
      caporegimes: [],
      rules: [],
      options: { showAscii: false },
      codeReviews: { autoAssignGoodfellas: true },
    });
    (getRandomMessage as jest.Mock).mockReturnValue("Authorized");
    (validateFiles as jest.Mock).mockReturnValue(defaultResults);

    await runGithubCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.success, "Authorized");
    expect(mockExit).toHaveBeenCalledWith(0);
    expect(showDonAscii).not.toHaveBeenCalled();
  });

  test("successfully exits and shows Don ascii", async () => {
    process.env.CI = "true";
    process.env.GITHUB_TOKEN = "token";
    (loadConfig as jest.Mock).mockResolvedValue({
      caporegimes: [],
      rules: [],
      options: { showAscii: true },
      codeReviews: { autoAssignGoodfellas: true },
    });
    (getRandomMessage as jest.Mock).mockReturnValue("Authorized");
    (validateFiles as jest.Mock).mockReturnValue(defaultResults);
    await runGithubCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.success, "Authorized");
    expect(mockExit).toHaveBeenCalledWith(0);
    expect(showDonAscii).toHaveBeenCalled();
  });

  test("exits with success if only warnings", async () => {
    process.env.CI = "true";
    process.env.GITHUB_TOKEN = "token";
    (loadConfig as jest.Mock).mockResolvedValue({
      caporegimes: [],
      rules: [],
      options: { showAscii: true },
      codeReviews: { autoAssignGoodfellas: true },
    });
    (validateFiles as jest.Mock).mockReturnValue({
      errors: [],
      warnings: ["Sensitive module modified"],
    });

    await runGithubCheck();
    expect(enforceRules).toHaveBeenCalledWith(
      {
        errors: [],
        warnings: ["Sensitive module modified"],
      },
      true
    );
  });

  test("exits with error if only errors", async () => {
    process.env.CI = "true";
    process.env.GITHUB_TOKEN = "token";
    (loadConfig as jest.Mock).mockResolvedValue({
      caporegimes: [],
      rules: [],
      options: { showAscii: true },
      codeReviews: { autoAssignGoodfellas: true },
    });
    (validateFiles as jest.Mock).mockReturnValue({
      errors: ["Unauthorized file"],
      warnings: [],
    });

    await runGithubCheck();
    expect(enforceRules).toHaveBeenCalledWith(
      {
        errors: ["Unauthorized file"],
        warnings: [],
      },
      true
    );
  });

  test("exits with error if errors and warnings", async () => {
    process.env.CI = "true";
    process.env.GITHUB_TOKEN = "token";
    (loadConfig as jest.Mock).mockResolvedValue({
      caporegimes: [],
      rules: [],
      options: { showAscii: false },
      codeReviews: { autoAssignGoodfellas: true },
    });
    (validateFiles as jest.Mock).mockReturnValue({
      errors: ["Unauthorized change"],
      warnings: ["Risky file touched"],
    });

    await runGithubCheck();
    expect(enforceRules).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: ["Unauthorized change"],
        warnings: ["Risky file touched"],
      }),
      false
    );
  });

  test("assigns reviewers if autoAssignGoodfellas or autoAssignCaporegimes are true", async () => {
    process.env.CI = "true";
    process.env.GITHUB_TOKEN = "token";

    (loadConfig as jest.Mock).mockResolvedValue({
      caporegimes: [],
      rules: [],
      options: { showAscii: false },
      codeReviews: {
        autoAssignGoodfellas: true,
        autoAssignCaporegimes: false,
      },
    });
    (validateFiles as jest.Mock).mockReturnValue(defaultResults);
    await runGithubCheck();
    expect(assignReviewersMock).toHaveBeenCalled();
  });

  test("doesn't assign reviewers if autoAssignGoodfellas and autoAssignCaporegimes are false", async () => {
    process.env.CI = "true";
    process.env.GITHUB_TOKEN = "token";

    (loadConfig as jest.Mock).mockResolvedValue({
      caporegimes: [],
      rules: [],
      options: { showAscii: false },
      codeReviews: {
        autoAssignGoodfellas: false,
        autoAssignCaporegimes: false,
      },
    });
    (validateFiles as jest.Mock).mockReturnValue(defaultResults);
    await runGithubCheck();
    expect(assignReviewersMock).not.toHaveBeenCalled();
  });

  test("exits with error on unknown exception", async () => {
    process.env.CI = "true";
    process.env.GITHUB_TOKEN = "token";

    (loadConfig as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected failure");
    });

    await runGithubCheck();
    expect(mockLog).toHaveBeenCalledWith(colorsMap.error, "Unexpected failure");
  });
});
