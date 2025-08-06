import { MessageType } from "@shared/models";
import { getRandomMessage } from ".";

describe("getRandomMessage", () => {
  beforeEach(() => {
    Math.random = jest.fn(() => 0); // Mock to always select the first message
  });

  describe("Success MessageType", () => {
    it("returns a success message with a committer", () => {
      const msg = getRandomMessage(MessageType.Success, {
        committers: [{ name: "oldblueeyes" }],
      });
      expect(msg).toBe("✓ Thank you oldblueeyes. You respected the codebase.");
    });

    it("returns a success message with committers", () => {
      const msg = getRandomMessage(MessageType.Success, {
        committers: [{ name: "oldblueeyes" }, { name: "tomhagen" }],
      });
      expect(msg).toBe(
        "✓ Thank you oldblueeyes and tomhagen. You respected the codebase."
      );
    });

    it("returns a success message without a committer", () => {
      const msg = getRandomMessage(MessageType.Success);
      expect(msg).toBe("✓ Thank you Committer. You respected the codebase.");
    });

    it("doesn't inject goodfellas in the message", () => {
      const msg = getRandomMessage(MessageType.Success, {
        goodfellas: [{ name: "solozzo" }, { name: "lucabrasi" }],
        committers: [{ name: "oldblueeyes" }],
      });
      expect(msg).toBe("✓ Thank you oldblueeyes. You respected the codebase.");
    });
  });

  describe("Error MessageType", () => {
    it("returns an error message with one committer and one goodfella", () => {
      const msg = getRandomMessage(MessageType.Error, {
        goodfellas: [{ name: "solozzo" }],
        committers: [{ name: "sonny" }],
      });
      expect(msg).toBe(
        "𐄂 sonny! You need permission from my trusted associate: solozzo. Nobody touches this without approval."
      );
    });

    it("returns an error message with committers and one goodfella", () => {
      const msg = getRandomMessage(MessageType.Error, {
        goodfellas: [{ name: "solozzo" }],
        committers: [{ name: "sonny" }, { name: "tomhagen" }],
      });
      expect(msg).toBe(
        "𐄂 sonny and tomhagen! You need permission from my trusted associate: solozzo. Nobody touches this without approval."
      );
    });

    it("returns an error message with committers and goodfellas", () => {
      const msg = getRandomMessage(MessageType.Error, {
        goodfellas: [
          { name: "solozzo" },
          { name: "mike" },
          { name: "johnny.fontane" },
        ],
        committers: [{ name: "sonny" }, { name: "tomhagen" }],
      });
      expect(msg).toBe(
        "𐄂 sonny and tomhagen! You need permission from my trusted associates: solozzo, mike, or johnny.fontane. Nobody touches this without approval."
      );
    });

    it("returns an error message with one committer and goodfellas", () => {
      const msg = getRandomMessage(MessageType.Error, {
        goodfellas: [
          { name: "solozzo" },
          { name: "mike" },
          { name: "johnny.fontane" },
        ],
        committers: [{ name: "sonny" }],
      });
      expect(msg).toBe(
        "𐄂 sonny! You need permission from my trusted associates: solozzo, mike, or johnny.fontane. Nobody touches this without approval."
      );
    });

    it("returns an error message without goodfellas nor committers", () => {
      const msg = getRandomMessage(MessageType.Error);
      expect(msg).toBe(
        "𐄂 Committer! You need permission from my trusted associate: a goodfella. Nobody touches this without approval."
      );
    });
  });

  describe("Warning MessageType", () => {
    it("returns a warning message with one committer and one goodfella", () => {
      const msg = getRandomMessage(MessageType.Warning, {
        committers: [{ name: "solozzo" }],
        goodfellas: [{ name: "tomhagen" }],
      });
      expect(msg).toBe(
        "⚠ solozzo: You ain't made, but we’ll let it slide this time. Get tomhagen to vouch for ya."
      );
    });

    it("returns a warning message with committers and one goodfella", () => {
      const msg = getRandomMessage(MessageType.Warning, {
        committers: [
          { name: "solozzo" },
          { name: "oldblueeyes" },
          { name: "mike" },
        ],
        goodfellas: [{ name: "tomhagen" }],
      });
      expect(msg).toBe(
        "⚠ solozzo, oldblueeyes, and mike: You ain't made, but we’ll let it slide this time. Get tomhagen to vouch for ya."
      );
    });

    it("returns a warning message with committers and goodfellas", () => {
      const msg = getRandomMessage(MessageType.Warning, {
        committers: [
          { name: "solozzo" },
          { name: "oldblueeyes" },
          { name: "mike" },
        ],
        goodfellas: [{ name: "tomhagen" }, { name: "lucabrasi" }],
      });
      expect(msg).toBe(
        "⚠ solozzo, oldblueeyes, and mike: You ain't made, but we’ll let it slide this time. Get tomhagen or lucabrasi to vouch for ya."
      );
    });

    it("returns a warning message with one committer and no goodfellas", () => {
      const msg = getRandomMessage(MessageType.Warning, {
        committers: [{ name: "solozzo" }],
      });
      expect(msg).toBe(
        "⚠ solozzo: You ain't made, but we’ll let it slide this time. Get a goodfella to vouch for ya."
      );
    });

    it("returns a warning message with no committer and one goodfellas", () => {
      const msg = getRandomMessage(MessageType.Warning, {
        goodfellas: [{ name: "lucabrasi" }],
      });
      expect(msg).toBe(
        "⚠ Committer: You ain't made, but we’ll let it slide this time. Get lucabrasi to vouch for ya."
      );
    });

    it("returns a warning message with no committer nor goodfellas", () => {
      const msg = getRandomMessage(MessageType.Warning);
      expect(msg).toBe(
        "⚠ Committer: You ain't made, but we’ll let it slide this time. Get a goodfella to vouch for ya."
      );
    });
  });

  describe("NoChanges MessageType", () => {
    it("returns a no changes message with a committer", () => {
      const msg = getRandomMessage(MessageType.NoChanges, {
        committers: [{ name: "solozzo" }],
      });
      expect(msg).toBe(
        "✓ You haven't modified a single file, solozzo. It's nice to be low-key, but one day, you gotta take action."
      );
    });

    it("returns a no changes message without committers", () => {
      const msg = getRandomMessage(MessageType.NoChanges);
      expect(msg).toBe(
        "✓ You haven't modified a single file, Committer. It's nice to be low-key, but one day, you gotta take action."
      );
    });
  });

  describe("NotFound MessageType", () => {
    it("returns a not found message", () => {
      const msg = getRandomMessage(MessageType.NotFound);
      expect(msg).toBe(
        "𐄂 The codefather.ts file doesn't exist. Maybe someone whacked it?"
      );
    });

    it("doesn't inject goodfella or committers", () => {
      const msg = getRandomMessage(MessageType.NotFound, {
        goodfellas: [{ name: "oldblueeyes" }, { name: "lucabrasi" }],
        committers: [{ name: "mile" }],
      });
      expect(msg).toBe(
        "𐄂 The codefather.ts file doesn't exist. Maybe someone whacked it?"
      );
    });
  });

  describe("NoGitConfig MessageType", () => {
    it("returns a no git config message without goodfellas", () => {
      const msg = getRandomMessage(MessageType.NoGitConfig);
      expect(msg).toBe("𐄂 You don't have a git config... Are you a cop?");
    });

    it("doesn't inject goodfella or committers", () => {
      const msg = getRandomMessage(MessageType.NoGitConfig, {
        goodfellas: [{ name: "oldblueeyes" }, { name: "lucabrasi" }],
        committers: [{ name: "mile" }],
      });
      expect(msg).toBe("𐄂 You don't have a git config... Are you a cop?");
    });
  });

  describe("Randomization", () => {
    it("selects different messages based on Math.random", () => {
      Math.random = jest.fn(() => 0); // Select first message
      const msg1 = getRandomMessage(MessageType.Success);
      expect(msg1).toBe("✓ Thank you Committer. You respected the codebase.");

      Math.random = jest.fn(() => 0.99); // Select last message
      const msg2 = getRandomMessage(MessageType.Success);
      expect(msg2).toBe(
        "✓ Committer: Even my consigliere asked who wrote that one."
      );
    });
  });

  describe("Dedup", () => {
    it("dedup committers and goodfellas names", () => {
      const msg = getRandomMessage(MessageType.Warning, {
        committers: [
          { name: "solozzo" },
          { name: "solozzo" },
          { name: "oldblueeyes" },
          { name: "michael.corleone" },
          { name: "michael.corleone" },
        ],
        goodfellas: [
          { name: "tomhagen" },
          { name: "lucabrasi" },
          { name: "tomhagen" },
        ],
      });
      expect(msg).toBe(
        "⚠ solozzo, oldblueeyes, and michael.corleone: You ain't made, but we’ll let it slide this time. Get tomhagen or lucabrasi to vouch for ya."
      );
    });
  });
});
