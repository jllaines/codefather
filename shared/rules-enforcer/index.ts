import { showDonAscii } from "@shared/ascii/don";
import { colorsMap, ValidationResult } from "@shared/models";

export function enforceRules(results: ValidationResult, showDon = true) {
  const donColor = results.errors.length
    ? colorsMap.error
    : results.warnings.length
      ? colorsMap.warning
      : undefined;

  if (showDon && donColor) showDonAscii(donColor);

  for (const warning of results.warnings) {
    console.log(colorsMap.warning, warning);
  }

  for (const error of results.errors) {
    console.log(colorsMap.error, error);
  }

  if (results.errors.length > 0) {
    process.exit(1);
  }
}
