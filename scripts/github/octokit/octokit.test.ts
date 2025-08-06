import { resolve } from "path";
import { CodefatherConfig, colorsMap } from "@shared/models";

describe("Octokit", () => {
  let consoleLogSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env.GITHUB_TOKEN = "dummy-token";
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("EXITED");
    });
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
    jest.clearAllMocks();
  });

  it("init - instantiate a new Octokit class", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    const octokit = Octokit.init();
    expect(typeof octokit.getCommitters).toBe("function");
    expect(typeof octokit.getModifiedFiles).toBe("function");
    expect(typeof octokit.getPullRequestID).toBe("function");
    expect(typeof octokit.assignReviewers).toBe("function");
  });
  it("getPullRequestID - return the pull request id", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: {
          pulls: { listFiles: jest.fn().mockResolvedValue({ data: [] }) },
        },
      }),
    }));
    const octokit = Octokit.init();
    const pr = octokit.getPullRequestID();
    expect(pr).toBe(88);
  });
  it("getPullRequestID- logs an error and exit if the pr number can't be fetched", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: {
          pulls: { listFiles: jest.fn().mockResolvedValue({ data: [] }) },
        },
      }),
    }));
    try {
      const octokit = Octokit.init();
      octokit.getPullRequestID();
    } catch (err) {
      expect(err instanceof Error ? err.message : err).toBe("EXITED");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        colorsMap.error,
        "No pull request number found."
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    }
  });
  it("getModifiedFiles - return an empty array of files if there is no diff", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 42 } },
      },
      getOctokit: () => ({
        rest: {
          pulls: { listFiles: jest.fn().mockResolvedValue({ data: [] }) },
        },
      }),
    }));
    const octokit = Octokit.init();
    const files = await octokit.getModifiedFiles();
    expect(files).toStrictEqual([]);
    expect(exitSpy).not.toHaveBeenCalled();
  });
  it("getModifiedFiles - return an array of files if there is a diff", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 42 } },
      },
      getOctokit: () => ({
        rest: {
          pulls: {
            listFiles: jest.fn().mockResolvedValue({
              data: [
                { filename: "src/core/index.ts" },
                { filename: "config/dev.env" },
              ],
            }),
          },
        },
      }),
    }));
    const octokit = Octokit.init();
    const files = await octokit.getModifiedFiles();
    expect(files).toStrictEqual([
      resolve(process.cwd(), "src/core/index.ts"),
      resolve(process.cwd(), "config/dev.env"),
    ]);
    expect(exitSpy).not.toHaveBeenCalled();
  });
  it("getCommitters - return only the username and the prefix of the pr author if vouchForAllCommitters is false", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: {
          pulls: {
            listCommits: jest.fn().mockResolvedValue({
              data: [
                {
                  commit: {
                    sha: "1",
                    author: { email: "michael.corleone@nyc.com" },
                  },
                  committer: { login: "mike" },
                },
                {
                  commit: {
                    sha: "2",
                    author: { email: "michael.corleone@nyc.com" },
                  },
                  committer: { login: "mike" },
                },
              ],
            }),
          },
        },
      }),
    }));
    const octokit = Octokit.init();
    const committers = await octokit.getCommitters(88, false);
    expect(committers).toStrictEqual([{ name: "mike" }]);
  });
  it("getCommitters - return the username and the prefix of all committers if vouchForAllCommitters is true", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: {
          pulls: {
            listCommits: jest.fn().mockResolvedValue({
              data: [
                {
                  commit: {
                    sha: "1",
                    author: { email: "michael.corleone@nyc.com" },
                  },
                  committer: { login: "mike" },
                },
                {
                  commit: {
                    sha: "2",
                    author: { email: "tom.hagen@don.com" },
                  },
                  committer: { login: "tomhagen" },
                },
                {
                  commit: {
                    sha: "3",
                    author: { email: "michael.corleone@nyc.com" },
                  },
                  committer: { login: "mike" },
                },
              ],
            }),
          },
        },
      }),
    }));
    const octokit = Octokit.init();
    const committers = await octokit.getCommitters(88);
    expect(committers).toStrictEqual([{ name: "mike" }, { name: "tomhagen" }]);
  });
  it("getCommitters - throw an error if there are no commits", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: {
          pulls: {
            listCommits: jest.fn().mockResolvedValue({
              data: [],
            }),
          },
        },
      }),
    }));
    try {
      const octokit = Octokit.init();
      await octokit.getCommitters(undefined, 88);
    } catch (err) {
      expect(err instanceof Error ? err.message : err).toBe(
        "𐄂 Couldn't find any commits in this pull request."
      );
    }
  });
  it("getCommitters - throw an error if there is no committers info found", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: {
          pulls: {
            listCommits: jest.fn().mockResolvedValue({
              data: [
                {
                  commit: {
                    sha: "1",
                    author: undefined,
                  },
                },
              ],
            }),
          },
        },
      }),
    }));
    try {
      const octokit = Octokit.init();
      await octokit.getCommitters(undefined, 88);
    } catch (err) {
      expect(err instanceof Error ? err.message : err).toBe(
        "𐄂 Couldn’t find an username in the commit author metadata."
      );
    }
  });
  it("assignReviewers - assign relevant goodfellas as reviewers", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    const mockRequestReviewers = jest.fn();
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: { pulls: { requestReviewers: mockRequestReviewers } },
      }),
    }));
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }, { name: "lucabrasi" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "solozzo" }, { name: "tomhagen" }],
        },
        {
          match: ["src/models/**"],
          goodfellas: [{ name: "mike" }, { name: "sonny" }],
        },
      ],
      codeReviews: {
        autoAssignGoodfellas: true,
        autoAssignCaporegimes: false,
      },
    };
    const committers = [{ name: "oldblueeyes" }, { name: "tom" }];
    const updatedFiles = [resolve(process.cwd(), "src/core/index.ts")];
    const octokit = Octokit.init();
    await octokit.assignReviewers(88, updatedFiles, committers, config);
    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: "don",
      repo: "empire",
      pull_number: 88,
      reviewers: ["solozzo", "tomhagen"],
    });
  });
  it("assignReviewers - assign relevant goodfellas and caporegimes as reviewers if autoAssignCaporegimes is true and don't duplicate reviewers", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    const mockRequestReviewers = jest.fn();
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: { pulls: { requestReviewers: mockRequestReviewers } },
      }),
    }));
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }, { name: "lucabrasi" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "solozzo" }, { name: "tomhagen" }],
        },
        {
          match: ["src/models/**"],
          goodfellas: [{ name: "mike" }, { name: "sonny" }],
        },
      ],
      codeReviews: {
        autoAssignGoodfellas: true,
        autoAssignCaporegimes: true,
      },
    };
    const committers = [{ name: "oldblueeyes" }, { name: "tom" }];
    const updatedFiles = [resolve(process.cwd(), "src/core/index.ts")];
    const octokit = Octokit.init();
    await octokit.assignReviewers(88, updatedFiles, committers, config);
    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: "don",
      repo: "empire",
      pull_number: 88,
      reviewers: ["solozzo", "lucabrasi", "tomhagen"],
    });
  });
  it("assignReviewers - assign a crew as reviewer", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    const mockRequestReviewers = jest.fn();
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: { pulls: { requestReviewers: mockRequestReviewers } },
      }),
    }));
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }, { name: "lucabrasi" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "solozzo" }, { name: "tomhagen" }],
          crews: ["clemenzaPeople"],
        },
        {
          match: ["src/models/**"],
          goodfellas: [{ name: "mike" }, { name: "sonny" }],
        },
      ],
      codeReviews: {
        autoAssignGoodfellas: true,
        autoAssignCaporegimes: true,
      },
      crews: {
        clemenzaPeople: [{ name: "paulieGatto" }, { name: "lucabrasi" }],
      },
    };
    const committers = [{ name: "oldblueeyes" }];
    const updatedFiles = [resolve(process.cwd(), "src/core/index.ts")];
    const octokit = Octokit.init();
    await octokit.assignReviewers(88, updatedFiles, committers, config);
    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: "don",
      repo: "empire",
      pull_number: 88,
      reviewers: ["solozzo", "lucabrasi", "tomhagen"],
      team_reviewers: ["clemenzaPeople"],
    });
  });
  it("assignReviewers - don't assign a committer if he's a goodfella or a caporegime and return unique reviewers", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    const mockRequestReviewers = jest.fn();
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: { pulls: { requestReviewers: mockRequestReviewers } },
      }),
    }));
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }, { name: "lucabrasi" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [
            { name: "oldblueeyes" },
            { name: "solozzo" },
            { name: "tomhagen" },
          ],
        },
        {
          match: ["src/models/**"],
          goodfellas: [{ name: "mike" }, { name: "sonny" }],
        },
      ],
      codeReviews: {
        autoAssignGoodfellas: true,
        autoAssignCaporegimes: true,
      },
    };
    const committers = [
      { name: "oldblueeyes" },
      { name: "lucabrasi" },
      { name: "tom" },
    ];
    const updatedFiles = [resolve(process.cwd(), "src/core/index.ts")];
    const octokit = Octokit.init();
    await octokit.assignReviewers(88, updatedFiles, committers, config);
    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: "don",
      repo: "empire",
      pull_number: 88,
      reviewers: ["solozzo", "tomhagen"],
    });
  });
  it("assignReviewers - assign reviewers across multiple rules", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    const mockRequestReviewers = jest.fn();
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: { pulls: { requestReviewers: mockRequestReviewers } },
      }),
    }));
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }, { name: "lucabrasi" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [
            { name: "oldblueeyes" },
            { name: "solozzo" },
            { name: "tomhagen" },
          ],
          crews: ["clemenzaPeople", "tessioTeam"],
        },
        {
          match: ["src/models/**"],
          goodfellas: [{ name: "mike" }, { name: "sonny" }],
          crews: ["tessioTeam"],
        },
        {
          match: ["src/utils/**"],
          goodfellas: [{ name: "tom" }],
        },
      ],
      codeReviews: {
        autoAssignGoodfellas: true,
        autoAssignCaporegimes: false,
      },
      crews: {
        clemenzaPeople: [{ name: "paulieGatto" }, { name: "lucabrasi" }],
        tessioTeam: [{ name: "salvatore" }],
      },
    };
    const committers = [{ name: "fredo" }];
    const updatedFiles = [
      resolve(process.cwd(), "src/core/index.ts"),
      resolve(process.cwd(), "src/models/message.ts"),
    ];
    const octokit = Octokit.init();
    await octokit.assignReviewers(88, updatedFiles, committers, config);
    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: "don",
      repo: "empire",
      pull_number: 88,
      reviewers: ["oldblueeyes", "solozzo", "tomhagen", "mike", "sonny"],
      team_reviewers: ["clemenzaPeople", "tessioTeam"],
    });
  });
  it("assignReviewers - don't assign reviwers if no rule is matched", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Octokit } = require(".");
    const mockRequestReviewers = jest.fn();
    jest.mock("@actions/github", () => ({
      context: {
        repo: { owner: "don", repo: "empire" },
        payload: { pull_request: { number: 88 } },
      },
      getOctokit: () => ({
        rest: { pulls: { requestReviewers: mockRequestReviewers } },
      }),
    }));
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }, { name: "lucabrasi" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "solozzo" }, { name: "tomhagen" }],
        },
        {
          match: ["src/models/**"],
          goodfellas: [{ name: "mike" }, { name: "sonny" }],
        },
      ],
      codeReviews: {
        autoAssignGoodfellas: true,
        autoAssignCaporegimes: false,
      },
    };
    const committers = [{ name: "oldblueeyes" }, { name: "tom" }];
    const updatedFiles = [
      resolve(process.cwd(), "src/utils/index.ts"),
      resolve(process.cwd(), ".env"),
    ];
    const octokit = Octokit.init();
    await octokit.assignReviewers(88, updatedFiles, committers, config);
    expect(mockRequestReviewers).not.toHaveBeenCalled();
  });
});
