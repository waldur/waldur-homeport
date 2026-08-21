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
