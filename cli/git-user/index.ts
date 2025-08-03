import { execSync } from "child_process";
import { getEmailPrefix } from "@shared/formatter";
import { getRandomMessage } from "@shared/messages";
import { GitUser, MessageType } from "@shared/models";

export function getLocalGitUser(): GitUser {
  try {
    const email = execSync("git config user.email", {
      encoding: "utf8",
    });
    const name = execSync("git config user.username", {
      encoding: "utf8",
    });
    if (!email && !name) {
      throw new Error();
    }
    const emailPrefix = getEmailPrefix(email);
    return { name, emailPrefix };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_: unknown) {
    throw new Error(getRandomMessage(MessageType.NoGitConfig));
  }
}
