import { useRouter } from '@uirouter/react';
import Axios from 'axios';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { parseQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { UsersService } from '@waldur/user/UsersService';

import { AuthService } from '../AuthService';

export const OauthLoginCompleted = () => {
  const router = useRouter();
  React.useEffect(() => {
    async function fetchToken() {
      const qs = parseQueryString(document.location.search.split('?', 2)[1]);
      const response = await Axios.post(
        ENV.apiEndpoint + 'api-auth/keycloak/',
        {
          clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.KEYCLOAK_CLIENT_ID,
          code: qs.code,
          state: qs.state,
          redirectUri: window.location.origin + '/#/oauth_login_completed/',
        },
      );
      AuthService.setAuthHeader(response.data.token);
      const user = await UsersService.getCurrentUser();
      AuthService.loginSuccess({
        data: { ...user, method: 'keycloak' },
      });
      window.location.replace('/#/profile/');
    }
    fetchToken();
  }, [router]);
  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('Logging user in')}</h3>
    </div>
  );
};
