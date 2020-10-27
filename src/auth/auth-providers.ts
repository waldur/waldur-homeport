import { ENV } from '@waldur/core/services';
import { openModalDialog } from '@waldur/modal/actions';

import { AuthButtonProps } from './AuthButton';
import { AuthSaml2Dialog } from './saml2/AuthSaml2Dialog';
import { loginSaml2 } from './saml2/store/actions';
import { getOauthCallback } from './utils';
import { AuthValimoDialog } from './valimo/AuthValimoDialog';

export const getAuthProviders: () => Omit<AuthButtonProps, 'mode'>[] = () => [
  {
    providerKey: 'facebook',
    label: 'Facebook',
    btnClass: 'btn-facebook',
    iconClass: 'fa-facebook-square',
    onClick: getOauthCallback({
      name: 'facebook',
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.FACEBOOK_CLIENT_ID,
      authUrl: 'https://www.facebook.com/v2.5/dialog/oauth',
      scope: 'email',
    }),
  },
  {
    providerKey: 'smartid',
    label: 'trusted identity',
    btnClass: 'btn-smartid',
    iconClass: 'fa-id-card-o',
    onClick: getOauthCallback({
      name: 'smartidee',
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.SMARTIDEE_CLIENT_ID,
      authUrl: 'https://id.smartid.ee/oauth/authorize',
      scope: '',
    }),
  },
  {
    providerKey: 'tara',
    label: ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_LABEL,
    btnClass: 'btn-smartid',
    iconClass: 'fa-id-card-o',
    onClick: getOauthCallback({
      name: 'tara',
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_CLIENT_ID,
      authUrl: ENV.plugins.WALDUR_AUTH_SOCIAL.TARA_SANDBOX
        ? 'https://tara-test.ria.ee/oidc/authorize'
        : 'https://tara.ria.ee/oidc/authorize',
      scope: 'openid',
    }),
  },
  {
    providerKey: 'keycloak',
    label: ENV.plugins.WALDUR_AUTH_SOCIAL.KEYCLOAK_LABEL,
    btnClass: 'btn-smartid',
    iconClass: 'fa-id-card-o',
    onClick: getOauthCallback({
      name: 'keycloak',
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.KEYCLOAK_CLIENT_ID,
      authUrl: ENV.plugins.WALDUR_AUTH_SOCIAL.KEYCLOAK_AUTH_URL,
      scope: 'openid',
    }),
  },
  {
    providerKey: 'eduteams',
    label: ENV.plugins.WALDUR_AUTH_SOCIAL.EDUTEAMS_LABEL,
    btnClass: 'btn-smartid',
    iconClass: 'fa-id-card-o',
    onClick: getOauthCallback({
      name: 'eduteams',
      clientId: ENV.plugins.WALDUR_AUTH_SOCIAL.EDUTEAMS_CLIENT_ID,
      authUrl: ENV.plugins.WALDUR_AUTH_SOCIAL.EDUTEAMS_AUTH_URL,
      scope: 'openid profile email eduperson_assurance ssh_public_key',
    }),
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
