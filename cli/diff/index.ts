import { execSync } from "child_process";
import { EOL } from "os";
import { resolve } from "path";

function runGitCommand(cmd: string): string[] {
  try {
    const result = execSync(cmd, { encoding: "utf-8" });
    return result
      .split(EOL)
      .filter(Boolean)
      .map((file) => resolve(file));
  } catch {
    return [];
  }
}

export async function getModifiedFiles(): Promise<string[]> {
  const unstaged = runGitCommand("git diff --name-only");
  const staged = runGitCommand("git diff --cached --name-only");
  const created = runGitCommand("git ls-files --others --exclude-standard");
  const deleted = runGitCommand("git ls-files --deleted");
  return Array.from(new Set([...unstaged, ...staged, ...created, ...deleted]));
}
