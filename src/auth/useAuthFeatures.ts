import { useMemo } from 'react';

import { ENV } from '@waldur/configs/default';

export const useAuthFeatures = () => {
  const methods = useMemo<Record<string, boolean>>(
    () =>
      ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS.reduce((result, item) => {
        result[item] = true;
        return result;
      }, {}),
    [],
  );

  const showSigninForm = methods.LOCAL_SIGNIN;

  const showValimo = methods.VALIMO;

  const showSaml2 =
    methods.SAML2 && !!ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL;

  const showSaml2Providers =
    methods.SAML2 &&
    ENV.plugins.WALDUR_AUTH_SAML2.ALLOW_TO_SELECT_IDENTITY_PROVIDER;

  const showSaml2Discovery =
    methods.SAML2 &&
    ENV.plugins.WALDUR_AUTH_SAML2.DISCOVERY_SERVICE_URL &&
    ENV.plugins.WALDUR_AUTH_SAML2.DISCOVERY_SERVICE_LABEL;

  const enableSeparator = !!(
    showSigninForm &&
    (showValimo || showSaml2 || showSaml2Providers || showSaml2Discovery)
  );

  return {
    SigninForm: showSigninForm,
    valimo: showValimo,
    saml2: showSaml2,
    saml2providers: showSaml2Providers,
    saml2discovery: showSaml2Discovery,
    enableSeperator: enableSeparator,
  };
};
