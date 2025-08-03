import type { Config } from "jest";

const config: Config = {
  transform: {
    "^.+\\.(ts|js)$": [
      "@swc/jest",
      {
        jsc: {
          baseUrl: ".",
          parser: {
            syntax: "typescript",
            tsx: true,
            dynamicImport: true,
          },
          paths: {
            "@cli/*": ["./cli/*"],
            "@scripts/*": ["./scripts/*"],
            "@shared/*": ["./shared/*"],
          },
          target: "esnext",
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleNameMapper: {
    "^@cli/(.*)$": "<rootDir>/cli/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;
