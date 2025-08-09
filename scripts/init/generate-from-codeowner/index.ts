import fs from "fs";
import {
  CodefatherConfig,
  CodefatherRule,
  CrewName,
  GitUser,
} from "@shared/models";

function isCrewOwner(owner: string): owner is CrewName {
  return owner.startsWith("@") && owner.includes("/");
}

function getValidCrewName(crew: string): string {
  const parts = crew.replace(/^@/, "").split("/");
  return parts.length > 1 ? parts[1] : parts[0] || crew;
}

function getValidGoodfella(goodfella: string): string {
  return goodfella.replace(/^@+/, "").split("/")[0] || goodfella;
}

async function parseCodeowners(filePath: string): Promise<CodefatherRule[]> {
  const content = await fs.promises.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const ownersCombos = new Map<string, CodefatherRule["match"]>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("#")) continue;
    const [match, ...owners] = line.split(/\s+/);
    if (match && owners.length > 0) {
      const ownersCombo = owners.sort().join(",");
      if (!ownersCombos.has(ownersCombo)) {
        ownersCombos.set(ownersCombo, [match]);
      } else {
        const data = ownersCombos.get(ownersCombo) || [];
        ownersCombos.set(ownersCombo, [...data, match]);
      }
    }
  }

  const rules: CodefatherRule[] = [];

  for (const [owners, match] of ownersCombos.entries()) {
    const crews: CrewName[] = [];
    const goodfellas: GitUser[] = [];

    owners.split(",").forEach((owner) => {
      const validOwner = owner.trim();
      if (isCrewOwner(validOwner)) {
        crews.push(getValidCrewName(validOwner));
      } else {
        goodfellas.push({ name: getValidGoodfella(validOwner) });
      }
    });

    rules.push({ match, goodfellas, ...(crews.length > 0 ? { crews } : {}) });
  }
  return rules;
}

function generateConfig(
  rules: CodefatherRule[],
  crews: CrewName[]
): CodefatherConfig {
  return {
    rules,
    codeReviews: { autoAssignGoodfellas: true },
    crews: crews.reduce((acc, crew) => ({ ...acc, [crew]: [] }), {}),
  };
}

export async function generateConfigFromCodeowners(
  codeownersFile: string
): Promise<{ config: CodefatherConfig; crews: CrewName[] }> {
  try {
    const rules = await parseCodeowners(codeownersFile);
    const crews = [
      ...new Set(rules.flatMap((rule) => rule.crews).filter(Boolean)),
    ] as CrewName[];
    return { config: generateConfig(rules, crews), crews };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_: unknown) {
    throw new Error("𐄂 Your CODEOWNER file is invalid.");
  }
}
