import Qs from 'qs';

import { EDUTEAMS_IDP } from './providers/constants';

const getStateId = () =>
  encodeURIComponent(Math.random().toString(36).substr(2));

export const getRedirectUri = (provider) =>
  `${document.baseURI}oauth_login_completed/${provider}/`;

export const getOauthURL = (provider) =>
  `${provider.auth_url}?${Qs.stringify({
    response_type: 'code',
    client_id: provider.client_id,
    redirect_uri: getRedirectUri(provider.provider),
    scope:
      provider.provider === EDUTEAMS_IDP
        ? 'openid profile email eduperson_assurance ssh_public_key'
        : 'openid',
    state: getStateId(),
  })}`;
