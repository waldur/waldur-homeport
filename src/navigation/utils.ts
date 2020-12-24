import { router } from '@waldur/router';

let state;
let params;

export function setPrevState(newState) {
  state = newState;
}

export function setPrevParams(newParams) {
  params = newParams;
}

export const goBack = () => {
  if (
    state &&
    state.name &&
    state.name !== 'errorPage.notFound' &&
    state.name !== 'errorPage.limitQuota'
  ) {
    router.stateService.go(state.name, params);
  } else {
    router.stateService.go('profile.details');
  }
};
