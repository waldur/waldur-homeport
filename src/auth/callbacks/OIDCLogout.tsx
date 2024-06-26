import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect } from 'react';

import { getIdentityProvider } from '@waldur/administration/api';
import { translate } from '@waldur/i18n';

export const OIDCLogout = () => {
  const router = useRouter();
  const { params } = useCurrentStateAndParams();
  const { data, isLoading, error } = useQuery(
    ['IdentityProvider', params.provider],
    () => getIdentityProvider(params.provider),
  );
  useEffect(() => {
    if (!data) {
      return;
    }
    if (data.logout_url) {
      window.location.href = data.logout_url;
    } else {
      router.stateService.go('login');
      return;
    }
  }, [data]);
  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10">
        <h1 className="fw-bold mb-10">
          {isLoading
            ? translate('Logging out')
            : error
              ? translate('Unable to load identity provider.')
              : data.logout_url
                ? translate('You are being redirected to identity provider.')
                : translate('You are being redirected to login page.')}
        </h1>
      </div>
    </div>
  );
};
