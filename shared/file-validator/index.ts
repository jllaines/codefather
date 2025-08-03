import { matchFilesAgainstRule } from "@shared/file-matcher";
import { getRandomMessage } from "@shared/messages";
import {
  GitUser,
  MessageType,
  type CodefatherConfig,
  type ValidationResult,
} from "@shared/models";
import { resolveConfigPath } from "@shared/path-resolver";

function areCommittersIncluded(
  authorizedUsers: GitUser[],
  committers: GitUser[]
): boolean {
  if (!authorizedUsers?.length) return false;
  return committers.every(({ name, emailPrefix }) =>
    authorizedUsers.some(
      (user) =>
        (name && user.name === name) ||
        (emailPrefix && user.emailPrefix === emailPrefix)
    )
  );
}

function getUnauthorizedCommitters(
  authorizedUsers: GitUser[],
  committers: GitUser[]
): GitUser[] {
  return committers.filter(
    ({ name, emailPrefix }) =>
      !authorizedUsers.some(
        (user) =>
          (name && user.name === name) ||
          (emailPrefix && user.emailPrefix === emailPrefix)
      )
  );
}

export function validateFiles(
  files: string[],
  committers: GitUser[],
  config: CodefatherConfig
): ValidationResult {
  const { caporegimes = [], rules = [] } = config;
  const result: ValidationResult = { errors: [], warnings: [] };
  const isCaporegime = areCommittersIncluded(caporegimes, committers);

  if (isCaporegime) return result;
  const rootDir = resolveConfigPath();

  for (const rule of rules) {
    const matched = matchFilesAgainstRule(files, rule.match, rootDir);
    if (matched.length === 0) continue;
    const authorizedUsers: GitUser[] = [
      ...caporegimes,
      ...(rule.goodfellas || []),
    ];
    if (rule.crews && config.crews) {
      const crewMembers = rule.crews
        .flatMap((crew) => config.crews?.[crew])
        .filter(Boolean) as GitUser[];
      authorizedUsers.push(...crewMembers);
    }

    const isGoodfella = areCommittersIncluded(authorizedUsers, committers);
    if (!isGoodfella) {
      const messageType = rule?.allowForgiveness
        ? MessageType.Warning
        : MessageType.Error;
      const unauthorizedCommitters: GitUser[] = getUnauthorizedCommitters(
        rule.goodfellas,
        committers
      );
      const msg =
        rule.message ||
        getRandomMessage(messageType, {
          goodfellas: authorizedUsers,
          committers: unauthorizedCommitters,
        });
      const entry = `${msg}\n\n Unauthorized files:\n${matched.map((f) => `   - ${f}`).join("\n")}\n`;

      if (rule.allowForgiveness) result.warnings.push(entry);
      else result.errors.push(entry);
    }
  }
  return result;
}
