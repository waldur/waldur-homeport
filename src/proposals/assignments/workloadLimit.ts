import { getErrorBody } from '@/core/ErrorMessageFormatter';

const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
};

// The refusal names the request flag that overrides it. The flag is an API
// detail, so the sentence pointing at it is dropped from what the user reads:
// the dialog offers the override as a button instead.
const OVERRIDE_HINT = /\s*Set override_workload_limit to assign anyway\.?\s*$/;

/**
 * The backend's reason when an assignment is refused because it would take the
 * reviewer above their maximum number of open assignments, or `null` for any
 * other failure.
 *
 * The refusal is a plain validation error with no code of its own; what marks
 * it is that its message names `override_workload_limit`, the flag that
 * assigns anyway.
 */
export const getWorkloadLimitMessage = (error: any): string | null => {
  const status = error?.status ?? error?.response?.status;
  if (status !== 400) return null;
  const body = getErrorBody(error) ?? error?.response?.data;
  const message = collectStrings(body).find((text) =>
    text.includes('override_workload_limit'),
  );
  return message ? message.replace(OVERRIDE_HINT, '').trim() : null;
};
