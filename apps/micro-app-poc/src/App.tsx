import { useEffect, useState } from 'react';
import { fixURL } from 'waldur-api-client';
import {
  configureAuthCore,
  initApiClient,
  isAuthenticated,
  StorageAdapter,
} from 'waldur-auth-core';
import { initBrandTokens } from 'waldur-design-tokens';
import { translate } from 'waldur-i18n-runtime';
import { fetchRuntimeConfig, getApiUrlFromMeta } from 'waldur-runtime-config';
import { initSentry } from 'waldur-telemetry';
import { BaseButton } from 'waldur-ui';

/**
 * Real localStorage-backed adapter — same persistence choice
 * waldur-homeport's own src/core/StorageManager.ts makes, namespaced under
 * this app's own key prefix so it can never collide with a real host's
 * `waldur/auth/*` keys even when both run on the same origin.
 */
function createLocalStorage(key: string): StorageAdapter {
  const namespacedKey = `waldur-micro-app-poc/${key}`;
  return {
    get: () => localStorage.getItem(namespacedKey),
    set: (next) => localStorage.setItem(namespacedKey, next),
    remove: () => localStorage.removeItem(namespacedKey),
  };
}

const apiUrl = getApiUrlFromMeta();

configureAuthCore({
  storage: {
    token: createLocalStorage('auth/token'),
    method: createLocalStorage('auth/method'),
    impersonation: createLocalStorage('auth/impersonation'),
    language: createLocalStorage('i18n/lang'),
  },
  getApiEndpoint: () => apiUrl,
  isConfigLoaded: () => true,
  isOidcAccessTokenEnabled: () => false,
  onSessionExpired: () => {
    // No router in this skeleton — a real host would redirect to login here.
  },
});

initApiClient();

export const App = () => {
  const [checks, setChecks] = useState<Record<string, string>>({});

  useEffect(() => {
    initBrandTokens('#175CD3');

    initSentry({
      dsn: '',
      release: 'micro-app-poc@0.0.0',
      environment: 'development',
      tracePropagationTargets: [],
    });

    setChecks({
      'waldur-auth-core: isAuthenticated()': String(isAuthenticated()),
      'waldur-api-client: fixURL()': fixURL('/marketplace-offerings/'),
      'waldur-runtime-config: getApiUrlFromMeta()': apiUrl,
      'waldur-i18n-runtime: translate()': translate(
        'Hello from a standalone micro-app',
      ),
    });

    // waldur-runtime-config: fetchRuntimeConfig() — a real SDK request
    // (configurationRetrieve() from waldur-js-client) against apiUrl. No
    // mock: run a real backend at apiUrl to see this succeed, otherwise the
    // request fails and that failure is shown below like any other API
    // error a real host app would surface.
    fetchRuntimeConfig()
      .then((config) =>
        setChecks((prev) => ({
          ...prev,
          'waldur-runtime-config: fetchRuntimeConfig()': `ok — default language: ${config.defaultLanguage}`,
        })),
      )
      .catch((error: { response?: Response } | Error) => {
        // waldur-auth-core's error interceptor spreads the thrown Error into
        // a plain object (losing its non-enumerable .message), so a network
        // failure here surfaces only a possible `.response`, not a message.
        const reason =
          error instanceof Error
            ? error.message
            : error.response
              ? `HTTP ${error.response.status}`
              : `no response — is a backend running at ${apiUrl}?`;
        setChecks((prev) => ({
          ...prev,
          'waldur-runtime-config: fetchRuntimeConfig()': `failed — ${reason}`,
        }));
      });
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold text-gray-900">
        {translate('waldur-micro-app-poc')}
      </h1>
      <p className="text-sm text-gray-600">
        Every control below is <code>waldur-ui</code>'s real{' '}
        <code>BaseButton</code>, themed by <code>waldur-design-tokens</code>{' '}
        with zero CSS or config copied from waldur-homeport's <code>src/</code>.
      </p>

      <div className="flex flex-wrap gap-3">
        <BaseButton
          label={translate('Primary')}
          variant="primary"
          size="lg"
          onClick={() => {}}
        />
        <BaseButton
          label={translate('Secondary')}
          variant="secondary"
          size="lg"
          onClick={() => {}}
        />
        <BaseButton
          label={translate('Danger')}
          variant="danger"
          size="lg"
          onClick={() => {}}
        />
      </div>

      <dl className="flex flex-col gap-1 rounded-lg border border-gray-200 p-4 text-sm">
        {Object.entries(checks).map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-mono text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
