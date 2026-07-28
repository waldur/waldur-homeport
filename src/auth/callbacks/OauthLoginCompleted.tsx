import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import Qs from 'qs';
import { FunctionComponent, useEffect, useState } from 'react';

import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { RedirectStorage } from '@/core/StorageManager';
import { getQueryString } from '@/core/utils';
import { translate } from '@/i18n';
import { useRequestToAccessOrganization } from '@/invitations/join-organization/submission';

import { redirectOnSuccess } from '../authNavigation';
import { exchangeToken, loginUser } from '../AuthService';

export const OauthLoginCompleted: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { provider },
  } = useCurrentStateAndParams();
  const [error, setError] = useState();
  const { checkAndRequest } = useRequestToAccessOrganization();

  useEffect(() => {
    async function fetchToken() {
      const qs = Qs.parse(getQueryString());
      try {
        const code = qs.code as string;
        const token = await exchangeToken(code);
        await loginUser(token, provider);
        // Only check for pending group invitation if NOT redirecting to user-group-invitation
        // (that route handles invitations via its own confirmation dialog)
        const redirect = RedirectStorage.get();
        if (redirect?.toState !== 'user-group-invitation') {
          await checkAndRequest();
        }
        redirectOnSuccess();
      } catch (e) {
        setError(
          e.response?.data?.detail ||
            e.data?.detail ||
            translate('Unknown error'),
        );
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
