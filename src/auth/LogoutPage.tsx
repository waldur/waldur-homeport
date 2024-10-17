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

import { ENV } from '@waldur/configs/default';
import { post } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { AuthService } from './AuthService';

export const LogoutPage: FunctionComponent = () => {
  const router = useRouter();
  useEffect(() => {
    post<{ logout_url?: string }>(ENV.apiEndpoint + 'api-auth/logout/').then(
      (response) => {
        AuthService.clearAuthCache();
        if (response.data.logout_url) {
          document.location.href = response.data.logout_url;
        } else {
          router.stateService.go('login');
        }
      },
    );
  }, []);
  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('User is being logged out.')}</h3>
    </div>
  );
};
