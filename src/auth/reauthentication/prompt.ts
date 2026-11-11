import type { ReauthenticationChallenge } from 'waldur-auth-core';

export interface ReauthenticationRequest {
  id: number;
  challenge: ReauthenticationChallenge;
  /** The user confirmed it is them: the grant goes to the waiting request. */
  confirm: (grant: string) => void;
  /** The user gave up: the waiting request fails with `reason`. */
  cancel: (reason: unknown) => void;
}

// Waiting requests, oldest first. The dialog shows the first one; the rest
// wait their turn, since each needs its own grant.
let queue: ReauthenticationRequest[] = [];
let lastId = 0;
const listeners = new Set<() => void>();

const settle = (request: ReauthenticationRequest) => {
  queue = queue.filter((item) => item !== request);
  listeners.forEach((listener) => listener());
};

/**
 * Asks the user to confirm it is them before the change `challenge` refused.
 * Resolves with a grant for `challenge.action`; rejects when they cancel.
 * Wired to waldur-auth-core as onReauthenticationRequired.
 */
export const requestReauthentication = (
  challenge: ReauthenticationChallenge,
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const request: ReauthenticationRequest = {
      id: ++lastId,
      challenge,
      confirm: (grant) => {
        settle(request);
        resolve(grant);
      },
      cancel: (reason) => {
        settle(request);
        reject(reason);
      },
    };
    queue = [...queue, request];
    listeners.forEach((listener) => listener());
  });

export const subscribeToReauthentication = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The request the dialog is for, or null when nothing is waiting. */
export const getPendingReauthentication = (): ReauthenticationRequest | null =>
  queue[0] ?? null;

/**
 * Fails every waiting request with `reason` and closes the dialog: the
 * session they belong to has ended, and the dialog must not stay over the
 * login page.
 */
export const cancelPendingReauthentication = (reason: unknown) => {
  const pending = queue;
  queue = [];
  pending.forEach((request) => request.cancel(reason));
  listeners.forEach((listener) => listener());
};
