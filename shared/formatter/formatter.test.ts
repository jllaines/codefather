import { getEmailPrefix } from ".";

describe("getEmailPrefix", () => {
  it("return the prefix of an email", () => {
    expect(getEmailPrefix("kay@corleone.com")).toBe("kay");
    expect(getEmailPrefix("tom.hagen@don.com")).toBe("tom.hagen");
    expect(getEmailPrefix("amerigo-bonasera@nyc.com")).toBe("amerigo-bonasera");
  });
  it("return undefined if there is no email", () => {
    expect(getEmailPrefix("")).toBeUndefined();
    expect(getEmailPrefix(undefined)).toBeUndefined();
    expect(getEmailPrefix(null)).toBeUndefined();
  });
});
