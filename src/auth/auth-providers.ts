import Qs from 'qs';

import { ENV } from '@waldur/core/services';
import { openModalDialog } from '@waldur/modal/actions';

import { AuthButtonProps } from './AuthButton';
import { AuthSaml2Dialog } from './saml2/AuthSaml2Dialog';
import { loginSaml2 } from './saml2/store/actions';
import { getStateId } from './utils';
import { AuthValimoDialog } from './valimo/AuthValimoDialog';

export const getAuthProviders: () => Omit<AuthButtonProps, 'mode'>[] = () => [
  {
    providerKey: 'google',
    label: 'Google',
    btnClass: 'btn-google',
    iconClass: 'fa-google-plus-square',
  },
  {
    providerKey: 'facebook',
    label: 'Facebook',
    btnClass: 'btn-facebook',
    iconClass: 'fa-facebook-square',
  },
  {
    providerKey: 'smartid',
    label: 'trusted identity',
    btnClass: 'btn-smartid',
    iconClass: 'fa-id-card-o',
  },
  {
    providerKey: 'tara',
    label: ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_LABEL,
    btnClass: 'btn-smartid',
    iconClass: 'fa-id-card-o',
  },
  {
    providerKey: 'keycloak',
    label: ENV.plugins.WALDUR_AUTH_SOCIAL.KEYCLOAK_LABEL,
    btnClass: 'btn-smartid',
    iconClass: 'fa-id-card-o',
    onClick: () => {
      const params = {
        response_type: 'code',
        client_id: ENV.plugins.WALDUR_AUTH_SOCIAL.KEYCLOAK_CLIENT_ID,
        // TODO: Avoid fragment in router
        // According to https://tools.ietf.org/html/rfc6749#section-3.1.2 it
        // is not allowed to have a fragment in the redirect uri.
        redirect_uri: window.location.origin + '/#/oauth_login_completed/',
        scope: 'openid',
        state: getStateId(),
      };
      const baseUrl = ENV.plugins.WALDUR_AUTH_SOCIAL.KEYCLOAK_AUTH_URL;
      window.location.href = `${baseUrl}?${Qs.stringify(params)}`;
    },
  },
  {
    providerKey: 'eduteams',
    label: ENV.plugins.WALDUR_AUTH_SOCIAL.EDUTEAMS_LABEL,
    btnClass: 'btn-smartid',
    iconClass: 'fa-id-card-o',
  },
  {
    providerKey: 'saml2',
    label: ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_LABEL,
    btnClass: 'btn-saml2',
    iconClass: 'fa-university',
    onClick: (dispatch) => {
      dispatch({
        type: loginSaml2.REQUEST,
        payload: {
          'identity-provider': {
            url: ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL,
          },
        },
      });
    },
  },
  {
    providerKey: 'saml2providers',
    btnClass: 'btn-saml2-edu',
    iconClass: 'fa-globe',
    label: 'eduGAIN',
    onClick: (dispatch) => dispatch(openModalDialog(AuthSaml2Dialog)),
  },
  {
    providerKey: 'valimo',
    btnClass: 'btn-mid',
    iconClass: 'fa-phone-square',
    label: ENV.plugins.WALDUR_AUTH_VALIMO.LABEL,
    onClick: (dispatch) => dispatch(openModalDialog(AuthValimoDialog)),
  },
];
