import { useDispatch } from 'react-redux';
import { apiAuthSaml2Login } from 'waldur-js-client';

import { redirectPost } from '@/auth/saml2/utils';
import { translate } from '@/i18n';
import { showErrorResponse } from '@/store/notify';

export const useSaml2 = () => {
  const dispatch = useDispatch();
  async function handleSaml2Login(providerUrl) {
    try {
      /* We support only 2 SAML2 bindings: HTTP redirect and HTTP POST.
       * If HTTP redirect binding is used, we're redirecting user
       * to the URL specified by url field.
       * If HTTP POST binding is used, we're submitting form with
       * SAMLRequest field to URL specified by url field.
       */
      const { data } = (await apiAuthSaml2Login({
        body: { idp: providerUrl },
      })) as any;
      if (data.binding === 'redirect') {
        window.location.assign(data.url);
      } else if (data.binding === 'post') {
        redirectPost(data.url, {
          SAMLRequest: data.request,
        });
      }
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to login via SAML2 protocol.'),
        ),
      );
    }
  }
  return handleSaml2Login;
};
