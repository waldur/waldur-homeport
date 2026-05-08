// Multipart drops all but the last array element on a CharField, so collapse to comma-separated string.
export const serializeNotificationEmails = (
  value: unknown,
): string | undefined => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean)
      .join(',');
  }
  if (typeof value === 'string') return value;
  return undefined;
};
