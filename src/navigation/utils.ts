import { $rootScope, $state } from '@waldur/core/services';

export const goBack = () => {
  const state = $rootScope.prevPreviousState;
  const params = $rootScope.prevPreviousParams;
  if (
    state &&
    state.name &&
    state.name !== 'errorPage.notFound' &&
    state.name !== 'errorPage.limitQuota'
  ) {
    $state.go(state.name, params);
  } else {
    $state.go('profile.details');
  }
};
