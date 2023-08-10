import { useRouter, useCurrentStateAndParams } from '@uirouter/react';
import Axios from 'axios';
import Qs from 'qs';
import { useState, useEffect, FunctionComponent } from 'react';

import { getIdentityProvider } from '@waldur/administration/api';
import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { UsersService } from '@waldur/user/UsersService';

import { AuthService } from '../AuthService';
import { getRedirectUri } from '../utils';

export const OauthLoginCompleted: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { provider },
  } = useCurrentStateAndParams();
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchToken() {
      const qs = Qs.parse(getQueryString());
      const url = `${ENV.apiEndpoint}api-auth/${provider}/`;
      try {
        const { client_id } = await getIdentityProvider(provider);
        const response = await Axios.post(url, {
          clientId: client_id,
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
        setError(e.data?.detail || translate('Unknown error'));
      }
    }
    fetchToken();
  }, [router, provider]);

  return error ? (
    <div className="middle-box text-center">
      <h3 className="app-title centered">{translate('Login failed')}</h3>
      {typeof error === 'string' && <p className="mt-3">{error}</p>}
      <p className="mt-3">
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
