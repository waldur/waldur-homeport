import { IdentityProviderLogo } from '@waldur/auth/providers/IdentityProviderLogo';

import { LoginButton } from './LoginButton';
import { EDUTEAMS_IDP } from './providers/constants';
import { getOauthCallback } from './utils';

export const OauthLoginButton = ({ provider }) => (
  <LoginButton
    image={<IdentityProviderLogo name={provider.provider} />}
    label={provider.label}
    onClick={getOauthCallback({
      name: provider.provider,
      clientId: provider.client_id,
      authUrl: provider.auth_url,
      scope:
        provider.provider === EDUTEAMS_IDP
          ? 'openid profile email eduperson_assurance ssh_public_key'
          : 'openid',
    })}
  />
);
