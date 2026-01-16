import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import Qs from 'qs';
import { FunctionComponent, useEffect, useState } from 'react';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { tryJoinOrganization } from '@waldur/invitations/tryJoinOrganization';

import * as AuthService from '../AuthService';
import { loginUser } from '../AuthService';

export const OauthLoginCompleted: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { provider },
  } = useCurrentStateAndParams();
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchToken() {
      const qs = Qs.parse(getQueryString());
      try {
        const token = decodeURIComponent(qs.token as string);
        await loginUser(token, provider);
        tryJoinOrganization();
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
