import type { Middleware } from 'redux';
import { User } from 'waldur-js-client';

import { initSentry as initSentryCore, setSentryUser } from 'waldur-telemetry';

import { SET_CURRENT_USER } from '@/workspace/constants';

import { ENV } from './config';

/**
 * Initializes Sentry from this app's runtime config (branding/plugin
 * settings fetched from the backend). No-ops when the backend hasn't
 * configured a DSN for this deployment.
 */
export function initSentry() {
  if (!ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN) {
    return;
  }
  const { hostname } = new URL(ENV.apiEndpoint);
  initSentryCore({
    release: `waldur-homeport@${ENV.buildId}`,
    dsn: ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_DSN,
    environment:
      ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_ENVIRONMENT || 'unknown',
    tracesSampleRate:
      ENV.plugins.WALDUR_CORE.HOMEPORT_SENTRY_TRACES_SAMPLE_RATE || 0.2,
    tracePropagationTargets: [hostname, /^\//],
  });
}

/**
 * Associates captured events with the current user by uuid only. Username and
 * email are deliberately omitted — a Waldur username can itself be PII (e.g. an
 * email-like OIDC identifier), and the uuid is enough to look the user up.
 * Runs on every `SET_CURRENT_USER` dispatch, which is the single funnel for
 * login, session refresh and logout (dispatched with `undefined`, which clears
 * the Sentry user).
 */
export const sentryUserMiddleware: Middleware = () => (next) => (action) => {
  if (action?.type === SET_CURRENT_USER) {
    const user: User | undefined = action.payload?.user;
    setSentryUser(user ? user.uuid : null);
  }
  return next(action);
};
