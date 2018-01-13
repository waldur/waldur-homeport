import store from './store';
import { localeUpdated } from './locale';
import { initConfig } from './config';

// @ngInject
export function attachHooks($rootScope, authService, ENV) {
  store.dispatch(initConfig(ENV));

  $rootScope.$on('$translateChangeSuccess', (event, {language}) => {
    store.dispatch(localeUpdated(language));
  });
}
