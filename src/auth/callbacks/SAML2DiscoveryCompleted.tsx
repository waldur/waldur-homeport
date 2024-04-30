import Qs from 'qs';
import { useEffect } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { useSaml2 } from '../saml2/hooks';

export const SAML2DiscoveryCompleted = () => {
  const handleSaml2Login = useSaml2();
  useEffect(() => {
    const qs = Qs.parse(getQueryString());
    handleSaml2Login(qs.entityID);
  });
  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3>
        {translate(
          'Identity provided has been selected via SAML2 discovery service. You will be redirected to the login page soon.',
        )}
      </h3>
    </div>
  );
};
