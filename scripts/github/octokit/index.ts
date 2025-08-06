import { resolve } from "path";
import { context, getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { RestEndpointMethodTypes } from "@octokit/rest";
import { matchFilesAgainstRule } from "@shared/file-matcher";
import { CodefatherConfig, colorsMap, CrewName, GitUser } from "@shared/models";

type Commits =
  RestEndpointMethodTypes["pulls"]["listCommits"]["response"]["data"];

export class Octokit {
  octokit: InstanceType<typeof GitHub>;
  constructor() {
    this.octokit = getOctokit(process.env.GITHUB_TOKEN || "");
  }

  static init(): Octokit {
    return new Octokit();
  }

  private getUniqueCommittersList(commits: Commits): GitUser[] {
    return commits.reduce(
      (acc, { committer }) => {
        const name = committer?.login;
        if (!name) return acc;
        const alreadyAdded = acc.nameMap.has(name);
        if (!alreadyAdded) {
          const committer: GitUser = { name };
          if (name) acc.nameMap.add(name);
          acc.list.push(committer);
        }
        return acc;
      },
      {
        nameMap: new Set(),
        list: [] as GitUser[],
      }
    ).list;
  }

  public async getCommitters(
    pullRequestID: number,
    vouchForAllCommitters = true
  ): Promise<GitUser[]> {
    const { data: commits } = await this.octokit.rest.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullRequestID,
    });

    if (!commits.length) {
      throw new Error("𐄂 Couldn't find any commits in this pull request.");
    }
    const commitsList = vouchForAllCommitters ? commits : [commits[0]];
    const committers = this.getUniqueCommittersList(commitsList as Commits);
    if (committers.length === 0) {
      throw new Error(
        "𐄂 Couldn’t find an username in the commit author metadata."
      );
    }
    return committers;
  }

  public getPullRequestID(): number {
    const pullRequestID = context.payload?.pull_request?.number;
    if (!pullRequestID) {
      console.log(
        colorsMap.error,
        "𐄂 Missing pull request number. Can't proceed without it."
      );
      process.exit(1);
    }
    return pullRequestID;
  }

  public async getModifiedFiles(pullRequestID: number): Promise<string[]> {
    const { data } = await this.octokit.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullRequestID,
    });
    return data.map((file: { filename: string }) => resolve(file.filename));
  }

  private getRelevantReviewers(
    files: string[],
    committers: GitUser[],
    config: CodefatherConfig
  ): { reviewers: string[]; crews: CrewName[] } {
    const { caporegimes = [], rules = [] } = config;
    const allReviewers: GitUser[] = config.codeReviews?.autoAssignCaporegimes
      ? caporegimes
      : [];
    const allCrews: CrewName[] = [];
    const cwd = process.cwd();

    for (const file of files) {
      const rule = rules.find((r) => {
        const matched = matchFilesAgainstRule([file], r.match, cwd);
        return matched.length > 0;
      });
      if (!rule) {
        continue;
      }
      if (rule.crews) {
        allCrews.push(...rule.crews);
      }

      allReviewers.push(...(rule.goodfellas || []));
    }
    const validReviewers = allReviewers.filter(
      ({ name }) =>
        !committers.some((committer) => name && committer.name === name)
    );
    const reviewers = [
      ...new Set(validReviewers.map(({ name }) => name).filter(Boolean)),
    ] as string[];
    const crews = [...new Set(allCrews)];
    return { reviewers, crews };
  }

  public async assignReviewers(
    pullRequestID: number,
    files: string[],
    committers: GitUser[],
    config: CodefatherConfig
  ): Promise<
    RestEndpointMethodTypes["pulls"]["requestReviewers"]["response"] | void
  > {
    const { reviewers, crews } = this.getRelevantReviewers(
      files,
      committers,
      config
    );
    if (reviewers.length === 0) return;
    return await this.octokit.rest.pulls.requestReviewers({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullRequestID,
      reviewers,
      ...(crews.length > 0 ? { team_reviewers: crews } : {}),
    });
  }
}
