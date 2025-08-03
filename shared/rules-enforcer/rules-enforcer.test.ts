import { showDonAscii } from "@shared/ascii/don";
import { colorsMap } from "@shared/models";
import { enforceRules } from ".";

jest.mock("@shared/ascii/don", () => ({
  showDonAscii: jest.fn(),
}));

describe("enforceRules", () => {
  let consoleLogSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("EXITED");
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("logs warnings with correct color and message", () => {
    const results = {
      errors: [],
      warnings: ["Warning 1", "Warning 2"],
    };

    enforceRules(results, true);

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      colorsMap.warning,
      "Warning 1"
    );
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      2,
      colorsMap.warning,
      "Warning 2"
    );
    expect(showDonAscii).toHaveBeenCalledWith(colorsMap.warning);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test("logs errors with correct color and message, and exits", () => {
    const results = {
      errors: ["Error 1", "Error 2"],
      warnings: [],
    };

    expect(() => enforceRules(results, true)).toThrow("EXITED");

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      colorsMap.error,
      "Error 1"
    );
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      2,
      colorsMap.error,
      "Error 2"
    );
    expect(showDonAscii).toHaveBeenCalledWith(colorsMap.error);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test("logs both warnings and errors with correct colors, and exits", () => {
    const results = {
      errors: ["Error 1"],
      warnings: ["Warning 1"],
    };

    expect(() => enforceRules(results, true)).toThrow("EXITED");

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      colorsMap.warning,
      "Warning 1"
    );
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      2,
      colorsMap.error,
      "Error 1"
    );
    expect(showDonAscii).toHaveBeenCalledWith(colorsMap.error);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test("does not call showDonAscii when showDon is false", () => {
    const results = {
      errors: [],
      warnings: ["Warning 1"],
    };

    enforceRules(results, false);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(colorsMap.warning, "Warning 1");
    expect(showDonAscii).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test("calls showDonAscii with warning color when there are only warnings", () => {
    const results = {
      errors: [],
      warnings: ["Warning 1"],
    };

    enforceRules(results, true);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(colorsMap.warning, "Warning 1");
    expect(showDonAscii).toHaveBeenCalledWith(colorsMap.warning);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test("calls showDonAscii with error color when there are only errors", () => {
    const results = {
      errors: ["Error 1"],
      warnings: [],
    };

    expect(() => enforceRules(results, true)).toThrow("EXITED");

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(colorsMap.error, "Error 1");
    expect(showDonAscii).toHaveBeenCalledWith(colorsMap.error);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test("calls showDonAscii with error color when there are errors and warnings", () => {
    const results = {
      errors: ["Error 1"],
      warnings: ["Warning 1"],
    };

    expect(() => enforceRules(results, true)).toThrow("EXITED");

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(colorsMap.error, "Error 1");
    expect(consoleLogSpy).toHaveBeenCalledWith(colorsMap.warning, "Warning 1");
    expect(showDonAscii).toHaveBeenCalledWith(colorsMap.error);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test("doesn't call showDonAscii if there are no errors nor warnings", () => {
    const results = {
      errors: [],
      warnings: [],
    };

    enforceRules(results, true);

    expect(consoleLogSpy).toHaveBeenCalledTimes(0);
    expect(showDonAscii).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
