import Axios from 'axios';

import { redirectPost } from '@waldur/auth/saml2/utils';
import { ENV } from '@waldur/core/services';

export const getSaml2IdentityProviders = (name: string) => {
  const params = {
    params: { name: name || '' },
  };
  return Axios.get(
    `${ENV.apiEndpoint}api-auth/saml2/providers`,
    params,
  ).then(({ data }) => (Array.isArray(data) ? data : []));
};

export const loginSaml2 = (provider: string) =>
  Axios.post(`${ENV.apiEndpoint}api-auth/saml2/login/`, { idp: provider });

export const loginSaml2FormData = (url, request) => {
  redirectPost(url, {
    SAMLRequest: request,
  });
};
