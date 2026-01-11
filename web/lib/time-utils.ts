import ms from "ms";

/**
 * Parses a time string (e.g., "5m", "1h 30m") into milliseconds
 * Returns undefined if invalid or empty
 */
export function parseTimeString(timeString: string): number | undefined {
  if (!timeString.trim()) return undefined;

  try {
    const parsed = ms(timeString as ms.StringValue);
    if (isNaN(parsed) || parsed <= 0) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

/**
 * Formats milliseconds into a human-readable time string
 */
export function formatTime(msValue: number | null | undefined): string {
  if (!msValue) return "";
  return ms(msValue, { long: true });
}

/**
 * Validates a time string and returns an error message if invalid
 */
export function validateTimeString(timeString: string, fieldName: string): string | undefined {
  if (!timeString.trim()) return undefined;

  const parsed = parseTimeString(timeString);
  if (parsed === undefined) {
    return `Invalid ${fieldName} format. Use formats like '5m', '1h 30m', '45s', etc.`;
  }
  return undefined;
}

/**
 * Gets a preview of the parsed time (e.g., "5 minutes")
 */
export function getTimePreview(timeString: string): string | undefined {
  if (!timeString.trim()) return undefined;

  const parsed = parseTimeString(timeString);
  if (parsed === undefined) return undefined;

  return ms(parsed, { long: true });
}

/**
 * Formats milliseconds into a short time string for input (e.g., "1h 30m")
 */
export function formatTimeForInput(msValue: number | null | undefined): string {
  if (!msValue) return "";
  return ms(msValue, { long: true });
}
