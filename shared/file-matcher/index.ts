import { relative } from "path";
import { CodefatherRule } from "@shared/models";

const normalizePath = (filePath: string) => filePath.replace(/\\/g, "/");

function globToRegExp(glob: string | RegExp): RegExp {
  if (glob instanceof RegExp) return glob;

  let normalizedGlob = normalizePath(glob.trim().replace(/^\.?\/+/, ""));

  // Auto-expand trailing slash to recursive match
  if (normalizedGlob.endsWith("/")) normalizedGlob += "**";

  const escaped = normalizedGlob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "§§")
    .replace(/\*/g, "[^/]*")
    .replace(/§§/g, ".*");

  return new RegExp(`^${escaped}$`);
}

export function matchFilesAgainstRule(
  files: string[],
  rulePattern: CodefatherRule["match"],
  rootDir: string
): string[] {
  const regexes = rulePattern.map(globToRegExp);
  const normalizedRootDir = normalizePath(rootDir);
  return files.filter((file) => {
    const normalizedFile = normalizePath(file.trim());
    const relativePath = normalizePath(
      relative(normalizedRootDir, normalizedFile)
    );
    return regexes.some((regex) => regex.test(relativePath));
  });
}
