import store from './store';
import { setCurrentCustomer } from './currentCustomer';
import { setCurrentProject } from './currentProject';
import { userLoggedIn, userUpdated, userLoggedOut } from './currentUser';
import { localeUpdated } from './locale';
import { initConfig } from './config';

// @ngInject
export function attachHooks($rootScope, authService, ENV) {
  store.dispatch(initConfig(ENV));

  $rootScope.$on('authService:signin', () => {
    store.dispatch(userLoggedIn(authService.user));
  });

  $rootScope.$on('CURRENT_USER_UPDATED', (event, { user }) => {
    store.dispatch(userUpdated(user));
  });

  $rootScope.$on('setCurrentProject', (event, { project }) => {
    store.dispatch(setCurrentProject(project));
  });

  $rootScope.$on('setCurrentCustomer', (event, { customer }) => {
    store.dispatch(setCurrentCustomer(customer));
  });

  $rootScope.$on('logoutStart', () => {
    store.dispatch(userLoggedOut());
  });

  $rootScope.$on('$translateChangeSuccess', (event, {language}) => {
    store.dispatch(localeUpdated(language));
  });
}
