import Qs from 'qs';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { loginSaml2Action } from '../saml2/store/actions';

export const SAML2DiscoveryCompleted = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const qs = Qs.parse(getQueryString());
    dispatch(loginSaml2Action(qs.entityID));
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
