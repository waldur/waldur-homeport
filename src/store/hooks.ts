import ReactGA from 'react-ga';

import { ENV, $rootScope, ngInjector } from '@waldur/core/services';

import { initConfig } from './config';
import { localeUpdated } from './locale';
import store from './store';

export function attachHooks() {
  store.dispatch(initConfig(ENV));

  $rootScope.$on('$translateChangeSuccess', (_, { language }) => {
    store.dispatch(localeUpdated(language));
  });

  ngInjector.get('$transitions').onSuccess({}, () => {
    if (ENV.GoogleAnalyticsID) {
      const $location = ngInjector.get('$location');
      ReactGA.pageview($location.url());
    }
  });
}
