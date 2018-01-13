import store from '@waldur/store/store';

import {
  userLoggedIn,
  userUpdated,
  userLoggedOut,
  setCurrentCustomer,
  setCurrentProject,
} from './actions';

export function attachHooks($rootScope, authService) {
  $rootScope.$on('authService:signin', () => {
    store.dispatch(userLoggedIn(authService.user));
  });

  $rootScope.$on('CURRENT_USER_UPDATED', (event, { user }) => {
    store.dispatch(userUpdated(user));
  });

  $rootScope.$on('logoutStart', () => {
    store.dispatch(userLoggedOut());
  });

  $rootScope.$on('setCurrentCustomer', (event, { customer }) => {
    store.dispatch(setCurrentCustomer(customer));
  });

  $rootScope.$on('setCurrentProject', (event, { project }) => {
    store.dispatch(setCurrentProject(project));
  });
}

attachHooks.$inject = ['$rootScope', 'authService'];
