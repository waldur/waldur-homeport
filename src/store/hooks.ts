import { ENV, $rootScope } from '@waldur/core/services';

import { initConfig } from './config';
import { localeUpdated } from './locale';
import store from './store';

export function attachHooks() {
  store.dispatch(initConfig(ENV));

  $rootScope.$on('$translateChangeSuccess', (_, { language }) => {
    store.dispatch(localeUpdated(language));
  });
}
