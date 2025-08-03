import { resolve } from "path";
import { getRandomMessage } from "@shared/messages";
import { CodefatherConfig } from "@shared/models";
import { validateFiles } from ".";

jest.mock("@shared/messages");

describe("validateFiles", () => {
  const cwd = process.cwd();
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("authorized committer modifying allowed files", () => {
    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ emailPrefix: "johnny.fontane" }],
        },
      ],
    };
    expect(
      validateFiles(
        [resolve(cwd, "src/core/index.ts")],
        [{ name: "oldblueeyes", emailPrefix: "johnny.fontane" }],
        config
      )
    ).toEqual({ errors: [], warnings: [] });
  });

  test("authorized committers modifying allowed files", () => {
    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "oldblueeyes" }, { name: "@tomhagen" }],
        },
      ],
    };
    expect(
      validateFiles(
        [resolve(cwd, "src/core/index.ts")],
        [{ name: "oldblueeyes" }, { name: "@tomhagen" }],
        config
      )
    ).toEqual({ errors: [], warnings: [] });
  });

  test("a caporegime can modify any file even if he's not listed as goodfella", () => {
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "oldblueeyes", emailPrefix: "johnny.fontane" }],
        },
      ],
    };
    expect(
      validateFiles(
        [resolve(cwd, "src/core/index.ts")],
        [{ name: "solozzo" }],
        config
      )
    ).toEqual({ errors: [], warnings: [] });
  });

  test("caporegimes can modify any file even if they are not goodfellas", () => {
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }, { name: "mike" }, { name: "solozzo" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "oldblueeyes" }],
        },
      ],
    };
    expect(
      validateFiles(
        [resolve(cwd, "src/core/index.ts")],
        [{ name: "solozzo" }, { name: "mike" }],
        config
      )
    ).toEqual({ errors: [], warnings: [] });
  });

  test("authorized crew members can modify allowed files", () => {
    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "oldblueeyes", emailPrefix: "johnny.fontane" }],
          crews: ["clemenzaPeople"],
        },
      ],
      crews: {
        clemenzaPeople: [{ name: "@paulieGatto" }, { name: "@lucabrasi" }],
      },
    };
    expect(
      validateFiles(
        [resolve(cwd, "src/core/index.ts")],
        [{ name: "@paulieGatto" }],
        config
      )
    ).toEqual({ errors: [], warnings: [] });
  });

  test("unauthorized committer triggers error", () => {
    (getRandomMessage as jest.Mock).mockReturnValue("Unauthorized!");

    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ emailPrefix: "johnny.fontane" }],
        },
      ],
    };

    const result = validateFiles(
      [resolve(cwd, "src/core/index.ts")],
      [{ name: "@tomhagen" }],
      config
    );

    expect(result.errors.length).toBe(1);
    expect(result.warnings.length).toBe(0);
    expect(result.errors[0]).toContain("Unauthorized!");
  });

  test("unauthorized committer triggers error even if some committers are authorized", () => {
    (getRandomMessage as jest.Mock).mockReturnValue("Unauthorized!");

    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "oldblueeyes" }],
        },
      ],
    };
    const result = validateFiles(
      [resolve(cwd, "src/core/index.ts")],
      [{ name: "oldblueeyes" }, { name: "@tomhagen" }],
      config
    );
    expect(result.errors.length).toBe(1);
    expect(result.warnings.length).toBe(0);
    expect(result.errors[0]).toContain("Unauthorized!");
  });

  test("unauthorized committer triggers error even if some committers are caporegimes", () => {
    (getRandomMessage as jest.Mock).mockReturnValue("Unauthorized!");

    const config: CodefatherConfig = {
      caporegimes: [{ name: "solozzo" }],
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "oldblueeyes" }],
        },
      ],
    };

    const result = validateFiles(
      [resolve(cwd, "src/core/index.ts")],
      [{ name: "@tomhagen" }, { name: "solozzo" }],
      config
    );
    expect(result.errors.length).toBe(1);
    expect(result.warnings.length).toBe(0);
    expect(result.errors[0]).toContain("Unauthorized!");
  });

  test("unauthorized committer triggers warning if allowForgiveness is true", () => {
    (getRandomMessage as jest.Mock).mockReturnValue("Forgiven, but noted");

    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ emailPrefix: "johnny.fontane" }],
          allowForgiveness: true,
        },
      ],
    };

    const result = validateFiles(
      [resolve(cwd, "src/core/index.ts")],
      [{ name: "@tomhagen" }],
      config
    );
    expect(result.errors.length).toBe(0);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain("Forgiven, but noted");
  });

  test("unauthorized committers triggers warning if allowForgiveness is true", () => {
    (getRandomMessage as jest.Mock).mockReturnValue("Forgiven, but noted");

    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "oldblueeyes" }],
          allowForgiveness: true,
        },
      ],
    };

    const result = validateFiles(
      [resolve(cwd, "src/core/index.ts")],
      [{ name: "@tomhagen" }, { name: "mike" }],
      config
    );
    expect(result.errors.length).toBe(0);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain("Forgiven, but noted");
  });

  test("unauthorized crew member triggers warning if allowForgiveness is true", () => {
    (getRandomMessage as jest.Mock).mockReturnValue("Forgiven, but noted");

    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ emailPrefix: "johnny.fontane" }],
          allowForgiveness: true,
          crews: ["tessioTeam"],
        },
      ],
      crews: {
        clemenzaPeople: [{ name: "@paulieGatto" }, { name: "@lucabrasi" }],
        tessioTeam: [{ name: "salvatore" }],
      },
    };

    const result = validateFiles(
      [resolve(cwd, "src/core/index.ts")],
      [{ name: "@paulieGatto" }],
      config
    );
    expect(result.errors.length).toBe(0);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain("Forgiven, but noted");
  });

  test("unauthorized committer triggers an error if an unauthorized file is spotted by a regex pattern", () => {
    const config: CodefatherConfig = {
      rules: [
        {
          match: [/index\.ts$/],
          goodfellas: [{ emailPrefix: "johnny.fontane" }],
          message: "Don't touch that!",
        },
      ],
    };

    const result = validateFiles(
      [resolve(cwd, "weird/nested/path/index.ts")],
      [{ name: "@tomhagen" }],
      config
    );
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain("Don't touch that!");
  });

  test("handles multiple rules with complex pattern match", () => {
    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ emailPrefix: "johnny.fontane" }],
          message: "Don't touch that!",
        },
        {
          match: ["*.env", "config/**", "src/utils/helpers.ts"],
          goodfellas: [{ emailPrefix: "tom.woltz" }],
          message: "Don't even think about it.",
        },
      ],
    };

    const files = [
      resolve(cwd, "src/core/index.ts"),
      resolve(cwd, "project/config/dev.env"),
      resolve(cwd, "project/.env"),
      resolve(cwd, "src/utils/helpers.ts"),
    ];

    const result = validateFiles(files, [{ emailPrefix: "tom.hagen" }], config);
    expect(result.errors).toHaveLength(2); // 3 unauthorized changes are spotted, but 2 rules are broken
    expect(result.errors[0]).toContain("Don't touch that!");
    expect(result.errors[1]).toContain("Don't even think about it.");
  });

  test("handles config with zero rules without error", () => {
    const config: CodefatherConfig = { rules: [] };

    expect(
      validateFiles(
        [resolve(cwd, "src/core/index.ts")],
        [{ emailPrefix: "tom.hagen" }],
        config
      )
    ).toStrictEqual({ errors: [], warnings: [] });
  });

  test("doesn't trigger an error if none of the modified files match a rule", () => {
    const config: CodefatherConfig = {
      rules: [
        {
          match: ["src/core/**"],
          goodfellas: [{ name: "oldblueeyes" }],
          allowForgiveness: true,
        },
      ],
    };

    expect(
      validateFiles(
        [
          resolve(cwd, "project/src/models/index.ts"),
          resolve(cwd, "project/.env"),
        ],
        [{ name: "@tomhagen" }],
        config
      )
    ).toStrictEqual({ errors: [], warnings: [] });
  });
});
