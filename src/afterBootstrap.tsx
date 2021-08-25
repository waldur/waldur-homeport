import * as Sentry from '@sentry/react';
import ReactGA from 'react-ga';

import { initAuthToken } from './auth/interceptor';
import { ENV } from './configs/default';
import { LanguageUtilsService } from './i18n/LanguageUtilsService';
import loadInspinia from './inspinia';
import { initConfig } from './store/config';
import store from './store/store';
import { attachTransitions } from './transitions';

export function afterBootstrap() {
  document.title = ENV.modePageTitle;
  if (ENV.plugins.WALDUR_CORE.GOOGLE_ANALYTICS_ID) {
    ReactGA.initialize(ENV.plugins.WALDUR_CORE.GOOGLE_ANALYTICS_ID);
  }
  if (ENV.SENTRY_DSN) {
    Sentry.init({
      dsn: ENV.SENTRY_DSN,
    });
  }
  loadInspinia();
  initAuthToken();
  store.dispatch(initConfig(ENV));
  LanguageUtilsService.checkLanguage();
  attachTransitions();
}
