import { ENV } from '@waldur/core/services';
import { openModalDialog } from '@waldur/modal/actions';

import { AuthButtonProps } from './AuthButton';
import { loginSaml2 } from './saml2/store/actions';

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
    providerKey: 'saml2',
    label: ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_LABEL,
    btnClass: 'btn-saml2',
    iconClass: 'fa-university',
    onClick: dispatch => {
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
    onClick: dispatch => dispatch(openModalDialog('authSaml2Dialog')),
  },
  {
    providerKey: 'valimo',
    btnClass: 'btn-mid',
    iconClass: 'fa-phone-square',
    label: ENV.plugins.WALDUR_AUTH_VALIMO.LABEL,
    onClick: dispatch => dispatch(openModalDialog('authValimoDialog')),
  },
];
