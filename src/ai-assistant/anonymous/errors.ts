import { translate } from '@/i18n';

const getStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object') {
    const status =
      (error as { status?: unknown; response?: { status?: unknown } }).status ??
      (error as { response?: { status?: unknown } }).response?.status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
};

// The backend's `detail` is only a display-ready message for some statuses:
// 403 carries a human sentence, but 409 puts a machine code (`per_ip_*`) and
// 400 wraps it in an array. Only surface it when it's a non-empty string.
const getDetailMessage = (error: unknown): string | undefined => {
  if (error && typeof error === 'object' && 'detail' in error) {
    const detail = (error as { detail?: unknown }).detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
  }
  return undefined;
};

/** Map an anon-endpoint failure to a user-facing message. Covers the documented status codes. */
export const mapAnonymousChatError = (error: unknown): string => {
  switch (getStatus(error)) {
    case 400:
      return translate(
        'Your message could not be processed. Please rephrase and try again.',
      );
    case 403:
      // 403 covers two distinct causes (IP temporarily blocked vs session
      // bound to another network). The backend's message says which; the
      // generic fallback only applies when no message came through.
      return (
        getDetailMessage(error) ??
        translate('This session has expired. Please start a new conversation.')
      );
    case 409:
      return translate(
        'The assistant is unavailable or your usage limit was reached. Please try again later.',
      );
    case 424:
      return translate('The assistant is currently disabled.');
    case 429:
      return translate(
        'The assistant is busy right now. Please try again in a moment.',
      );
    case 503:
      return translate(
        'The assistant is at capacity today. Please try again tomorrow.',
      );
    default: {
      // Reuse the string-only guard: an unmapped status can still carry an
      // object/array `detail`, and String(detail) would surface '[object
      // Object]' to the user.
      const detail = getDetailMessage(error);
      if (detail) return detail;
      // No status and no detail is the common network failure (fetch rejects
      // with a TypeError). Surface the friendly message rather than a raw
      // 'Failed to fetch' / 'Load failed' from error.message.
      return translate('Failed to connect to the assistant.');
    }
  }
};

/**
 * Whether a stream failure warrants minting a fresh anonymous session id.
 *
 * The backend's stream endpoint raises 403 for three cases, and every one of
 * them carries a localized `detail` sentence with no machine code:
 *  - "Session is bound to a different network..." — session-scoped (e.g. the
 *    visitor's IP changed mid-session); a fresh session id, bound to the current
 *    IP, recovers it. This is the case we must reset on.
 *  - "...temporarily blocked" (per-IP injection block) and "Cannot determine
 *    client IP" — not session-scoped, so a reset does not help. But it is
 *    harmless: the per-IP gate re-checks and re-raises before the new session is
 *    even bound, so the visitor keeps seeing the same message.
 *
 * Since the frontend cannot tell them apart (detail is a display string, not a
 * discriminator), treat any 403 as a reset trigger — it fixes the recoverable
 * case and does no harm in the others.
 */
export const isAnonymousSessionExpired = (error: unknown): boolean =>
  getStatus(error) === 403;
