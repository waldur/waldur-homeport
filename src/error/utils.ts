import { StateService, TransitionOptions } from '@uirouter/react';

import { router } from '@/router';

let state;
let params;

export function setPrevState(newState) {
  state = newState;
}

export function setPrevParams(newParams) {
  params = newParams;
}

export const goBack = () => {
  if (state && state.name && state.name !== 'errorPage.notFound') {
    router.stateService.go(state.name, params);
  } else {
    router.stateService.go('profile.details');
  }
};

/**
 * The error states have no url of their own, so a plain transition into one
 * lets UI-Router sync the address bar to the layout's empty url: the 404 page
 * renders while the address bar reads '/', and refreshing or copying the link
 * no longer reproduces what is on screen. `location: false` keeps the address
 * that produced the error, matching the url='*path' catch-all state that
 * already handles fully unknown routes.
 */
export const goToNotFound = () =>
  router.stateService.go('errorPage.notFound', undefined, { location: false });

// Where an HTTP error status sends the user, for both failed transitions
// (transitions.ts) and failed queries (core/queryClient.ts). The error states
// have no url of their own, so they keep the address that failed, as
// goToNotFound() does; profile-manage is a real page with its own url.
const ERROR_PAGES: Record<
  number,
  { state: string; options?: TransitionOptions }
> = {
  403: { state: 'errorPage.noPermission', options: { location: false } },
  404: { state: 'errorPage.notFound', options: { location: false } },
  // HTTP 428 Precondition Required - user profile incomplete with enforcement enabled
  428: { state: 'profile-manage' },
  500: { state: 'errorPage.serverError', options: { location: false } },
  503: {
    state: 'errorPage.serviceNotAvailable',
    options: { location: false },
  },
};

/**
 * The SDK's error interceptor spreads the response body onto the thrown error
 * and attaches the transport fields next to it, so the status is on the error
 * itself; an axios-style error carries it on `response`.
 */
export const getErrorStatus = (error): number | undefined =>
  error?.response?.status ?? error?.status;

/**
 * Navigates to the page for the error's HTTP status. Returns false, without
 * navigating, when the status has no page of its own, leaving the fallback to
 * the caller.
 */
export const goToErrorPage = (
  error,
  stateService: StateService = router.stateService,
): boolean => {
  const page = ERROR_PAGES[getErrorStatus(error)];
  if (!page) {
    return false;
  }
  Promise.resolve(stateService.go(page.state, undefined, page.options)).catch(
    () => {
      // Superseded by the user's next navigation; nothing to report.
    },
  );
  return true;
};
