import { getModifiedFiles } from "@cli/diff";
import { getLocalGitUser } from "@cli/git-user";
import { showDonAscii } from "@shared/ascii/don";
import { validateFiles } from "@shared/file-validator";
import { loadConfig } from "@shared/loader";
import { getRandomMessage } from "@shared/messages";
import { colorsMap, GitUser, MessageType } from "@shared/models";
import { enforceRules } from "@shared/rules-enforcer";

function showSuccessMessage(
  type: MessageType,
  color: string,
  showDon: boolean,
  user: GitUser
) {
  if (showDon) {
    showDonAscii(color);
  }
  const message = getRandomMessage(type, { committers: [user] });
  console.log(color, message);
}

export async function runCheck(): Promise<void> {
  try {
    const config = await loadConfig();
    const files = await getModifiedFiles();
    const showDon = config.options?.showAscii ?? true;
    const user = getLocalGitUser();

    if (files.length === 0) {
      return showSuccessMessage(
        MessageType.NoChanges,
        colorsMap.info,
        showDon,
        user
      );
    }
    const results = validateFiles(files, [user], config);

    if (results.errors.length === 0 && results.warnings.length === 0) {
      return showSuccessMessage(
        MessageType.Success,
        colorsMap.success,
        showDon,
        user
      );
    }
    return enforceRules(results, showDon);
  } catch (err) {
    return console.log(
      colorsMap.error,
      err instanceof Error ? err.message : String(err)
    );
  }
}
