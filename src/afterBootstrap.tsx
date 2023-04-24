import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import ReactGA from 'react-ga';

import { initAuthToken } from './auth/interceptor';
import { ENV } from './configs/default';
import { LanguageUtilsService } from './i18n/LanguageUtilsService';
import { initConfig } from './store/config';
import store from './store/store';
import { attachTransitions } from './transitions';
import { initWorkspace } from './workspace/WorkspaceStorage';

function initSentry() {
  if (ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN) {
    const { hostname } = new URL(ENV.apiEndpoint);
    Sentry.init({
      release: `waldur-homeport@${ENV.buildId}`,
      dsn: ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          tracePropagationTargets: [hostname, /^\//],
        }),
      ],
      environment:
        ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_ENVIRONMENT || 'unknown',
      tracesSampleRate:
        ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_TRACES_SAMPLE_RATE || 0.2,
    });
  }
}

export function afterBootstrap() {
  document.title = ENV.plugins.WALDUR_CORE.FULL_PAGE_TITLE;
  if (ENV.plugins.WALDUR_CORE.GOOGLE_ANALYTICS_ID) {
    ReactGA.initialize(ENV.plugins.WALDUR_CORE.GOOGLE_ANALYTICS_ID);
  }
  initSentry();
  initAuthToken();
  store.dispatch(initConfig(ENV));
  LanguageUtilsService.checkLanguage();
  attachTransitions();
  initWorkspace();
}
