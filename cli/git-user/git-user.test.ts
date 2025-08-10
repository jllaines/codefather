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

  it("returns an user with an username", () => {
    (execSync as jest.Mock).mockReturnValueOnce("tomhagen");
    expect(getLocalGitUser()).toEqual({ name: "tomhagen" });
  });

  it("returns an user with a trimmed username", () => {
    (execSync as jest.Mock).mockReturnValueOnce("tomhagen ");
    expect(getLocalGitUser()).toEqual({ name: "tomhagen" });
    (execSync as jest.Mock).mockReturnValueOnce("tomhagen\n\n");
    expect(getLocalGitUser()).toEqual({ name: "tomhagen" });
  });

  it("throws an error if execSync fails", () => {
    (execSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error();
    });
    expect(() => getLocalGitUser()).toThrow("Error message");
  });

  it("throws an error if there is no username in the git config", () => {
    (execSync as jest.Mock).mockReturnValueOnce(undefined);
    expect(() => getLocalGitUser()).toThrow();
  });
});
