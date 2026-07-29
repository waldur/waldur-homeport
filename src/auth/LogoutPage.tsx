/*
 * For security reasons, third-party authentication backends, such as SAML2,
 * expect that when user is logged out, he is redirected to the logout URL so that
 * user session would be cleaned both in Waldur and authentication backend.
 *
 * Consider the following workflow:
 *
 * 1) When login is completed, authentication method is persisted in backend session.
 * 2) Authentication token and authentication method is cleaned up in the auth storage.
 * 3) User is redirected to the logout URL returned from REST API.
 * 4) After user is successfully logged out from third-party authentication backend,
 * such as SAML2, he is redirected back to the HomePort.
 */
import { useRouter } from '@uirouter/react';
import { useEffect, FunctionComponent } from 'react';
import { apiAuthLogout } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { RedirectStorage } from '@/core/StorageManager';
import { translate } from '@/i18n';
import { teardownRealtimeConsumers } from '@/realtime/useRealtimeConnection';

import { clearAuthCache } from './authNavigation';

export const LogoutPage: FunctionComponent = () => {
  const router = useRouter();
  useEffect(() => {
    // Delete this session's event consumers while still authenticated — the
    // backend tears down their RabbitMQ queues and users, so the DRF token
    // being deleted below stops working as a broker credential immediately
    // instead of after the daily stale sweep. Best-effort and bounded:
    // logout must never hang on it.
    // Deliberately NOT gated on the realtime_updates feature flag: cleanup is
    // guarded by what exists (the session's registered-consumer set — empty
    // and an instant no-op when the feature never ran), not by what is
    // enabled, so consumers can never leak if registration paths or flag
    // state evolve.
    Promise.race([
      teardownRealtimeConsumers(),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]).then(() =>
      apiAuthLogout().then((response) => {
        RedirectStorage.remove();
        clearAuthCache();
        if (typeof response.data === 'object' && response.data.logout_url) {
          document.location.href = response.data.logout_url;
        } else {
          router.stateService.go('login');
        }
      }),
    );
  }, []);
  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('User is being logged out.')}</h3>
    </div>
  );
};
