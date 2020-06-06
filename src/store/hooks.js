import { initConfig } from './config';
import { localeUpdated } from './locale';
import store from './store';

// @ngInject
export function attachHooks($rootScope, authService, ENV) {
  store.dispatch(initConfig(ENV));

  $rootScope.$on('$translateChangeSuccess', (event, { language }) => {
    store.dispatch(localeUpdated(language));
  });
}
