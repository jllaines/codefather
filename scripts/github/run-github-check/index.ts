import fs from "fs";
import path from "path";
import { showDonAscii } from "@shared/ascii/don";
import { validateFiles } from "@shared/file-validator";
import { loadConfig } from "@shared/loader";
import { colorsMap, MessageType } from "@shared/models";
import { getRandomMessage } from "@shared/messages";
import { enforceRules } from "@shared/rules-enforcer";
import { Octokit } from "../octokit";

export async function runGithubCheck() {
  try {
    if (!process.env.CI && process.env.GITHUB_ACTIONS !== "true") {
      console.log(
        colorsMap.error,
        "𐄂 This script is intended to run inside GitHub Actions."
      );
      process.exit(1);
    }
    if (!process.env.GITHUB_TOKEN) {
      console.log(
        colorsMap.error,
        "𐄂 GITHUB_TOKEN is missing. Pass it via `env:` in your workflow to make this work."
      );
      process.exit(1);
    }
    const config = await loadConfig();
    const showDon = config.options?.showAscii ?? true;
    const octokit = Octokit.init();
    const pullRequestID = octokit.getPullRequestID();
    const committers = await octokit.getCommitters(
      pullRequestID,
      config.options?.vouchForAllCommitters
    );
    const files = await octokit.getModifiedFiles(pullRequestID);
    const results = validateFiles(files, committers, config);

    const addReviewers = config.codeReviews?.autoAssignGoodfellas ?? true;
    const hasCodeownersFile = fs.existsSync(
      path.resolve(process.cwd(), "./.github/CODEOWNERS")
    );

    if (
      !hasCodeownersFile &&
      (addReviewers || !!config.codeReviews?.autoAssignCaporegimes)
    ) {
      await octokit.assignReviewers(pullRequestID, files, committers, config);
    }

    if (results.errors.length === 0 && results.warnings.length === 0) {
      if (showDon) {
        showDonAscii(colorsMap.success);
      }
      console.log(
        colorsMap.success,
        getRandomMessage(MessageType.Success, { committers })
      );
      process.exit(0);
    }
    return enforceRules(results, showDon);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(colorsMap.error, msg);
    process.exit(1);
  }
}
