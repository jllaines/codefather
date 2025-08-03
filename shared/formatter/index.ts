export function getEmailPrefix(
  email: string | undefined | null
): string | undefined {
  if (!email) return undefined;
  return email.trim().split("@")[0];
}
