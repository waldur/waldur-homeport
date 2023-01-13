import * as Sentry from '@sentry/react';
import ReactGA from 'react-ga';

import { initAuthToken } from './auth/interceptor';
import { ENV } from './configs/default';
import { LanguageUtilsService } from './i18n/LanguageUtilsService';
import { initConfig } from './store/config';
import store from './store/store';
import { attachTransitions } from './transitions';

export function afterBootstrap() {
  document.title = ENV.plugins.WALDUR_CORE.FULL_PAGE_TITLE;
  if (ENV.plugins.WALDUR_CORE.GOOGLE_ANALYTICS_ID) {
    ReactGA.initialize(ENV.plugins.WALDUR_CORE.GOOGLE_ANALYTICS_ID);
  }
  if (ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN) {
    const dsn = ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN;
    const sentryEnvironment =
      ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_ENVIRONMENT || 'unknown';
    Sentry.init({
      dsn: dsn,
      environment: sentryEnvironment,
    });
  }
  initAuthToken();
  store.dispatch(initConfig(ENV));
  LanguageUtilsService.checkLanguage();
  attachTransitions();
}
