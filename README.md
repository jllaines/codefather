<img width="1003" height="377" alt="banner" src="https://res.cloudinary.com/dmjisqsyo/image/upload/v1754334056/banner_cjwgin.png" />


[![CI](https://github.com/DoneDeal0/codefather/actions/workflows/ci.yml/badge.svg)](https://github.com/DoneDeal0/codefather/actions/workflows/ci.yml)
[![CD](https://github.com/DoneDeal0/codefather/actions/workflows/cd.yml/badge.svg)](https://github.com/DoneDeal0/codefather/actions/workflows/cd.yml)
![GitHub Tag](https://img.shields.io/github/v/tag/DoneDeal0/codefather?label=latest%20release)


<hr/>

# WHAT IS IT?

**Codefather protects your codebase by controlling who can change what. Set authorization levels, lock down files, and enforce your rules—offline via CLI or online with GitHub Actions.**

ℹ️ The documentation is also available on our [website](https://donedeal0.gitbook.io/codefather/)!

<hr/>

## CODEOWNERS COMPARISON

**Codefather** can serve as a drop-in replacement for GitHub’s CODEOWNERS—or play alongside it like a trusted consigliere.

GitHub’s CODEOWNERS lets you define file owners in your codebase and automatically assign them as reviewers. No pull request can be merged until an appropriate codeowner has approved it.

**Codefather** offers more flexibility in assigning codeowners: support for various roles (teams, leads, developers), complex file-match rules, local execution, commit protection, and more. It can prevent unauthorized changes, warn developers, list prohibited files with error levels and contact points, block sensitive merges via GitHub Actions, and auto-assign reviewers when needed.

We’ve designed **Codefather** for a delightful developer experience—a single config file for both CLI and GitHub Action usage, efficient commands to protect your codebase, automatic translation of CODEOWNERS into Codefather config, and over 100 personalized reactions to your commits. Whether you trespass the rules, flirt with the limits, or honor the codebase like a true professional, Codefather responds with style.

**Whether you’re enforcing strict governance or just want the Don watching over your commits, Codefather brings clarity, control, and charisma to your workflow.**

| FEATURE  | CODEFATHER | GITHUB CODEOWNERS |
|--|--|--|
|Files and folders protection | ✅ | ✅ |
|Github Action  | ✅ | ✅ |
|Auto-assign reviewers  | ✅ | ✅ |
|Teams support | ✅ | ✅ |
|CLI + pre-commit | ✅ | ❌ |
|Roles hierarchy | ✅ | ❌ |
|Personalized feedbacks | ✅ | ❌ |
|Customizable config  | ✅ | ❌ |
|Commit blockage | ✅ | ❌ |
|Godfather vibe  | ✅ | ❌ |

## SCREENSHOTS

<div style="display: flex; flex-wrap: wrap; gap: 8px;">

<img width="305" height="254" alt="success" src="https://res.cloudinary.com/dmjisqsyo/image/upload/v1754334056/success_fojaed.png" />

<img width="305" height="254" alt="info" src="https://res.cloudinary.com/dmjisqsyo/image/upload/v1754334056/info_gchx1t.png" />

<img width="305" height="254" alt="error" src="https://res.cloudinary.com/dmjisqsyo/image/upload/v1754334055/error_mk5fem.png" />

<img width="305" height="254" alt="warning" src="https://res.cloudinary.com/dmjisqsyo/image/upload/v1754334056/warning_xvf5c8.png" />

</div>


## INSTALLATION

```bash
npm install @donedeal0/codefather --save-dev
```

## USAGE

**Codefather** has 3 commands:

```bash
# checks if your access rules are respected in your repository
codefather 
```

```bash
# creates a default config.ts at the root of your repository and add a `codefather` command to your package.json
codefather-init 
```

`codefather-init` accepts two flags: 
  - `--json`, to generate a `codefather.json` file
  - `--overwrite` to overwrite an existing codefather config.

```bash
# similar to the `codefather` command, but works in a Github Action environment
codefather-github
```

You can either add a script shortcut in your `package.json`:

```json
"scripts": {
  "codefather": "codefather",
}
```

Or directly run the commands with `npx`:

```bash
npx codefather
npx codefather-init
```

## CONFIG

At the root of your repository, add a `codefather.ts` or `codefather.json` file. 

```ts
import type { CodefatherConfig } from "@donedeal0/codefather";

export default {
  caporegimes: [
    { name: "solozzo" },
    { name: "@lucabrasi", emailPrefix: "luca.brasi" },
  ],
  rules: [
    {
      match: ["package.json", "src/core/**", /^src\/app\/.*\.css$/],
      goodfellas: [
        { name: "solozzo" },
        { name: "@tomhagen", emailPrefix: "tom.hagen" },
      ],
      crews: ["clemenzaPeople"],
      allowForgiveness: false,
    },
    {
      match: ["src/models/**"],
      goodfellas: [
        { name: "mike", emailPrefix: "michael.corleone" },
        { name: "sonny", emailPrefix: "sonny" },
      ],
      allowForgiveness: true,
      message: "Custom message to tell you to NOT TOUCH THE MODELS!",
    },
  ],
  options: {
    showAscii: true,
    vouchForAllCommitters: true,
  },
  codeReviews: {
    autoAssignGoodfellas: true,
    autoAssignCaporegimes: true,
  },
  crews: {
    clemenzaPeople: [{ name: "@paulieGatto" }, { name: "@lucabrasi" }],
  },
} satisfies CodefatherConfig;
```

⚙️ Here's how it works. 

> The `CodefatherConfig` allows you to control which users can modify parts of your codebase, and to refine the behavior of `codefather`. 

```ts
type CodefatherConfig {
  /** List of users authorized to modify any files in your repository.
   * name: github username.
   * emailPrefix: prefix of the user email tied to their Github account (e.g. johnny.fontane@jazz.com should be johnny.fontane).
   */
  caporegimes?: GitUser[];
  /** Rules that apply to protected files and folders */
  rules: CodefatherRule[];
  /** Options to refine the output */
  options?: {
    /** If true, the codefather face will appear in the terminal. Defaults to true. */
    showAscii?: boolean;
    /** If true, all the pull request committers will be checked against the authorized users. Only used in a GitHub Action context. Defaults to true. */
    vouchForAllCommitters?: boolean;
  };
  /** Options to auto assign reviewers on Github */
  codeReviews?: {
    /** If true, goodfellas responsible for modified files will be assigned on relevant pull requests, except the committers. Defaults to true. */
    autoAssignGoodfellas: boolean;
    /** If true, caporegimes will be assigned on every pull request except the committers. Defaults to false. */
    autoAssignCaporegimes: boolean;
  };
  /** Group users into teams. Crew names and composition are flexible in CLI mode but should match your github teams if used in a Github Action */
  crews?: Record<CrewName, GitUser[]>;
}
```

> A `Rule` defines which users can change a set of files. 

```ts
type CodefatherRule {
  /** List of the files or folders that can only be modified by a given list of users */
  match: Array<RegExp | string>;
  /** List of users authorized to modify the list of files or folders.
   * name: github username.
   * emailPrefix: prefix of the user email tied to their Github account (e.g. johnny.fontane@jazz.com should be johnny.fontane) .
   */
  goodfellas: GitUser[];
  /** List of authorized user crews. The crews must be defined at the root of your config when used in CLI mode. */
  crews?: CrewName[];
  /** The message displayed if an unauthorized user tries to modify a protected file. If empty, a random message will be generated. */
  message?: string;
  /** If true, a warning will be issued and the script will not throw an error. False by default. */
  allowForgiveness?: boolean;
}
```

> A `GitUser` is a developer in your codebase:

```ts
type GitUser = {
  name?: string;
  emailPrefix?: string;
};
```

You can use either the name, the email, or both, depending on your preference. The name should match your GitHub username (e.g. `@tom.hagen`). If you prefer the email, it should also be tied to your Github account. 

For security reasons, only the email prefix is allowed in your config (e.g. `johnny.fontane@jazz.com` should be `johnny.fontane`). 

In CLI mode, the name and email are retrieved from your Git config. You can set them like this:

```bash
 git config --global user.username "DonCorleone"
 git config --global user.email "vito.corleone@nyc.com"
```

You can verify the current values like this:

```bash
git config user.username # return DonCorleone
git config user.email # return vito.corleone@nyc.com
```

In a Github Action, `codefather` will use Github's API, so you don't have to worry about the git config.

> A `CrewName` is the name of a developers team

```ts
type CrewName = string;
```

<hr/>

# GITHUB ACTION

Add this code in your `.github/workflows/codefather.yml` (the file name is up to you). The `GITHUB_TOKEN` will be automatically injected by Github.

```yml
name: Codefather Validation
on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install

      - name: Run Codefather
        run: npx codefather-github
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🛡️ ENFORCE REVIEWS

To enforce reviews from codeowners (goodfellas, caporegimes and crews), consider enabling branch protection in your repository settings. To do it:

- Go to `settings`
- Click on `Branches`on the left sidebar
- Select `Add classic branch protection rule`
- Check 
  - `Require a pull request before merging`
  - `Require approvals`
- You're now under the protection of the Codefather. 

<hr/>

# GLOSSARY

**Codefather** uses the Godfather's lingo. Although you don't need to know it to use the library, here are the definition of the special words used in the config file:

- `caporegime`: a captain who leads a group of mafia members. It's a tech-lead.
- `goodfella`: an appellation for a mobster (like "wise-guy" or "made man"). It's a developer.

<hr/>

# CODEFATHER VIBE

We believe open source libraries should be both useful and entertaining. The Don will amuse you with over 100 personalized reactions to your commits—whether you trespassed the rules, flirted with the limits, or respected the codebase like an honorable developer.

This being said, if you don't like the gangster movie atmosphere and still want to use `codefather`, you can absolutely opt-out by providing your own custom messages and hiding the Don's face in the terminal. 

## CREDITS

DoneDeal0 | talk.donedeal0[at]gmail.com

## SUPPORT

If you or your company uses **Codefather**, please show your support by becoming a sponsor! Your name and company logo will be displayed on the `README.md`. 

Premium support is also available. https://github.com/sponsors/DoneDeal0

<br/>
<a href="https://github.com/sponsors/DoneDeal0" target="_blank">
<img width="999" height="371" alt="sponsor" src="https://res.cloudinary.com/dmjisqsyo/image/upload/v1754334056/respect_wjtqm6.png" />
</a>
<br/>

## CONTRIBUTING

Issues and pull requests are welcome!
