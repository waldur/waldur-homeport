import Qs from 'qs';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { useSaml2 } from '../saml2/hooks';

export const SAML2DiscoveryCompleted = () => {
  const dispatch = useDispatch();
  const handleSaml2Login = useSaml2();
  useEffect(() => {
    const qs = Qs.parse(getQueryString());
    dispatch(handleSaml2Login(qs.entityID));
  }, [dispatch]);
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
