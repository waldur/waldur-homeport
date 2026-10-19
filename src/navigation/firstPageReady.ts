import { RejectType } from '@uirouter/react';

import {
  getPendingChunks,
  onPendingChunksChange,
} from '@/navigation/pageLoading';
import { router } from '@/router';

// A layout chunk that arrives renders the page, whose own chunk starts a tick
// later; this long without any pending chunk means the page's code is all in.
const SETTLE_MS = 100;
// Never hold the first page back longer than this once its route resolved.
const MAX_WAIT_MS = 10_000;
// Fallback cap if the initial transition itself hangs before resolving a route.
const MAX_ROUTING_WAIT_MS = 15_000;

/**
 * Calls back once the first page can be shown whole: the first transition has
 * succeeded (or failed outright, so its error page can show) and the code
 * chunks for its layout and page have finished downloading. Until then the
 * page would be blank, then a lone spinner per chunk.
 *
 * Data the page fetches is not waited for: pages show their own loading
 * states for that, as on every later navigation.
 *
 * Returns a function that cancels the wait.
 */
export function whenFirstPageReady(callback: () => void): () => void {
  let done = false;
  let routed = false;
  let settleTimer: ReturnType<typeof setTimeout>;
  let capTimer: ReturnType<typeof setTimeout>;
  let offChunks: () => void = () => undefined;

  // Guard against a stuck transition or unhandled hang before any route resolves.
  const routingCapTimer = setTimeout(() => finish(), MAX_ROUTING_WAIT_MS);

  const cleanup = () => {
    clearTimeout(settleTimer);
    clearTimeout(capTimer);
    clearTimeout(routingCapTimer);
    offChunks();
    offSuccess();
    offError();
  };

  const finish = () => {
    if (done) {
      return;
    }
    done = true;
    cleanup();
    callback();
  };

  const settle = () => {
    clearTimeout(settleTimer);
    if (getPendingChunks() === 0) {
      settleTimer = setTimeout(finish, SETTLE_MS);
    }
  };

  const onRouted = () => {
    if (routed || done) {
      return;
    }
    routed = true;
    clearTimeout(routingCapTimer);
    offChunks = onPendingChunksChange(settle);
    capTimer = setTimeout(finish, MAX_WAIT_MS);
    settle();
  };

  const offSuccess = router.transitionService.onSuccess({}, onRouted);
  // A redirect supersedes the transition with another one, so wait for that;
  // any other failure leaves the app on whatever it can render now.
  const offError = router.transitionService.onError({}, (transition) => {
    if (transition.error()?.type !== RejectType.SUPERSEDED) {
      onRouted();
    }
  });

  // The first transition may already be over by the time this subscribes.
  if (router.globals.current?.name) {
    onRouted();
  }

  return () => {
    done = true;
    cleanup();
  };
}
