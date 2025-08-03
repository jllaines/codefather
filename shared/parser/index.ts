export function safeJSONParse<T>(json: string): T {
  try {
    return JSON.parse(json);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    throw new Error(
      "Your JSON file is invalid. You gotta respect the rules if you want my help."
    );
  }
}
