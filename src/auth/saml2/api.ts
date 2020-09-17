import Axios from 'axios';

import { redirectPost } from '@waldur/auth/saml2/utils';
import { getSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

export const getSaml2IdentityProviders = async (
  name: string,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    name,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getSelectData(
    `${ENV.apiEndpoint}api-auth/saml2/providers`,
    params,
  );
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const loginSaml2 = (provider: string) =>
  Axios.post(`${ENV.apiEndpoint}api-auth/saml2/login/`, { idp: provider });

export const loginSaml2FormData = (url, request) => {
  redirectPost(url, {
    SAMLRequest: request,
  });
};
