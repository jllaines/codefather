import { execSync } from "child_process";
import { getLocalGitUser } from ".";

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("@shared/messages", () => ({
  getRandomMessage: jest.fn(() => "Error message"),
  MessageType: {
    NoGitConfig: "NoGitConfig",
  },
}));

describe("getLocalGitUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns an user with both email and username", () => {
    (execSync as jest.Mock)
      .mockReturnValueOnce("tom.hagen@don.com")
      .mockReturnValueOnce("@tomhagen");
    expect(getLocalGitUser()).toEqual({
      name: "@tomhagen",
      emailPrefix: "tom.hagen",
    });
  });

  it("returns an user with email only", () => {
    (execSync as jest.Mock)
      .mockReturnValueOnce("tom.hagen@don.com")
      .mockReturnValueOnce(undefined);
    expect(getLocalGitUser()).toEqual({
      name: undefined,
      emailPrefix: "tom.hagen",
    });
  });

  it("returns an user with username only", () => {
    (execSync as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce("@tomhagen");
    expect(getLocalGitUser()).toEqual({
      name: "@tomhagen",
      emailPrefix: undefined,
    });
  });

  it("throws an error if execSync fails", () => {
    (execSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error("No email config");
    });
    expect(() => getLocalGitUser()).toThrow("Error message");
  });
  it("throws an error if there is no email and no username in the git config", () => {
    (execSync as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);
    expect(() => getLocalGitUser()).toThrow();
  });
});
