import { useRouter, useCurrentStateAndParams } from '@uirouter/react';
import Axios from 'axios';
import Qs from 'qs';
import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { UsersService } from '@waldur/user/UsersService';

import { AuthService } from '../AuthService';
import { getRedirectUri } from '../utils';

const getClientId = (provider) =>
  ({
    facebook: ENV.plugins.WALDUR_AUTH_SOCIAL.FACEBOOK_CLIENT_ID,
    keycloak: ENV.plugins.WALDUR_AUTH_SOCIAL.KEYCLOAK_CLIENT_ID,
    smartidee: ENV.plugins.WALDUR_AUTH_SOCIAL.SMARTIDEE_CLIENT_ID,
    tara: ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_CLIENT_ID,
    eduteams: ENV.plugins.WALDUR_AUTH_SOCIAL.EDUTEAMS_CLIENT_ID,
  }[provider]);

export const OauthLoginCompleted = () => {
  const router = useRouter();
  const {
    params: { provider },
  } = useCurrentStateAndParams();
  const [error, setError] = React.useState();

  React.useEffect(() => {
    async function fetchToken() {
      const qs = Qs.parse(document.location.search.split('?', 2)[1]);
      const url = `${ENV.apiEndpoint}api-auth/${provider}/`;
      try {
        const response = await Axios.post(url, {
          clientId: getClientId(provider),
          code: qs.code,
          state: qs.state,
          redirectUri: getRedirectUri(provider),
        });
        AuthService.setAuthHeader(response.data.token);
        const user = await UsersService.getCurrentUser();
        AuthService.loginSuccess({
          data: { ...user, method: provider },
        });
        AuthService.redirectOnSuccess();
      } catch (e) {
        setError(e.data.detail);
      }
    }
    fetchToken();
  }, [router, provider]);

  return error ? (
    <div className="middle-box text-center">
      <h3 className="app-title centered">{translate('Login failed')}</h3>
      {typeof error === 'string' && <p className="m-t-md">{error}</p>}
      <p className="m-t-md">
        <Link state="login"> &lt; {translate('Back to login')} </Link>
      </p>
    </div>
  ) : (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>{translate('Logging user in')}</h3>
    </div>
  );
};
