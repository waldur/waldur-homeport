import { randomUUID } from '@/core/utils';

let anonymousSessionId: string | undefined;

/** One conversation per page lifetime. session_id is bound to the caller IP server-side on first use. */
export const getAnonymousSessionId = (): string => {
  anonymousSessionId ??= randomUUID();
  return anonymousSessionId;
};

/**
 * Drop the in-memory session id so the next getAnonymousSessionId() mints a fresh
 * one. Called when the backend rejects the bound session as no longer valid
 * (session-expired 403); without this the same dead id would be retried for the
 * page lifetime and every send would keep failing.
 */
export const resetAnonymousSession = (): void => {
  anonymousSessionId = undefined;
};
