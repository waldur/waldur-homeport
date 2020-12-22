import Qs from 'qs';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { AuthButtonProps } from './AuthButton';
import { loginSaml2Action } from './saml2/store/actions';
import { getOauthCallback } from './utils';

const AuthSaml2Dialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "AuthSaml2Dialog" */ './saml2/AuthSaml2Dialog'),
  'AuthSaml2Dialog',
);

const AuthValimoDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AuthValimoDialog" */ './valimo/AuthValimoDialog'
    ),
  'AuthValimoDialog',
);

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
      dispatch(
        loginSaml2Action(ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL),
      );
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
    providerKey: 'saml2discovery',
    btnClass: 'btn-saml2-edu',
    iconClass: 'fa-globe',
    label: ENV.plugins.WALDUR_AUTH_SAML2.DISCOVERY_SERVICE_LABEL,
    onClick: () => {
      const discovery = ENV.plugins.WALDUR_AUTH_SAML2.DISCOVERY_SERVICE_URL;
      const params = {
        entityID: `${ENV.plugins.WALDUR_AUTH_SAML2.base_url}/api-auth/saml2/metadata/`,
        return: `${window.location.origin}/saml2_discovery_completed/`,
      };
      window.location.href = `${discovery}?${Qs.stringify(params)}`;
    },
  },
  {
    providerKey: 'valimo',
    btnClass: 'btn-mid',
    iconClass: 'fa-phone-square',
    label: ENV.plugins.WALDUR_AUTH_VALIMO.LABEL,
    onClick: (dispatch) => dispatch(openModalDialog(AuthValimoDialog)),
  },
];
