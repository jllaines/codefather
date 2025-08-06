import { CodefatherConfig } from "@shared/models";
import { safeJSONParse } from ".";

const config: CodefatherConfig = {
  caporegimes: [{ name: "solozzo" }],
  rules: [
    {
      match: ["src/core/**"],
      goodfellas: [{ name: "oldblueeyes" }],
      crews: ["clemenzaPeople"],
    },
  ],
  crews: {
    clemenzaPeople: [{ name: "paulieGatto" }, { name: "lucabrasi" }],
  },
};

describe("safeJSONParse", () => {
  it("parse a valid JSON", () => {
    expect(safeJSONParse(JSON.stringify(config))).toStrictEqual(config);
  });
  it("throws if the JSON is invalid", () => {
    expect(() => safeJSONParse("invalid/[[$^}")).toThrow();
  });
});
