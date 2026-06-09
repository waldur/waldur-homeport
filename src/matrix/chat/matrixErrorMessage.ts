import { translate } from '@/i18n';

/**
 * With the SDK configured `throwOnError`, a failed request throws the parsed
 * JSON body directly. DRF errors — the `matrix_credentials` rate limit (429)
 * and the `MatrixClientError` (400) — both arrive as `{ detail }`, so surface
 * that text. Returns null for shapes without a usable detail (native Errors,
 * network failures) so callers fall back to their own generic message.
 */
const getMatrixErrorDetail = (error: unknown): string | null => {
  const detail = (error as any)?.detail;
  return typeof detail === 'string' && detail ? detail : null;
};

// DRF's Throttled.detail is "Request was throttled. Expected available in N
// seconds." (the wait clause is dropped when the throttle has no wait time).
const THROTTLE_RE = /throttled/i;
const WAIT_RE = /(\d+)\s*seconds?/i;

// Turn the raw retry delay into an approximate, human phrase. The exact second
// count ("3494 seconds") is noise to a user — they only need the ballpark.
const formatRetryWait = (seconds: number): string => {
  if (seconds >= 3600) {
    const hours = Math.round(seconds / 3600);
    return hours === 1
      ? translate('an hour')
      : translate('{hours} hours', { hours });
  }
  if (seconds >= 60) {
    const minutes = Math.round(seconds / 60);
    return minutes === 1
      ? translate('a minute')
      : translate('{minutes} minutes', { minutes });
  }
  const secs = Math.max(1, Math.round(seconds));
  return secs === 1
    ? translate('a second')
    : translate('{seconds} seconds', { seconds: secs });
};

/**
 * Resolve a user-facing message from a failed Matrix request. Rewrites the raw
 * DRF rate-limit string into a friendly, humanized message; passes any other
 * backend detail through unchanged; falls back to `fallback` when there is no
 * detail to show.
 */
export const getMatrixErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const detail = getMatrixErrorDetail(error);
  if (!detail) {
    return fallback;
  }
  if (THROTTLE_RE.test(detail)) {
    const match = detail.match(WAIT_RE);
    return match
      ? translate('Too many chat requests. Please try again in {wait}.', {
          wait: formatRetryWait(Number(match[1])),
        })
      : translate('Too many chat requests. Please try again later.');
  }
  return detail;
};
