import { IdentityProviderLogo } from '@waldur/auth/providers/IdentityProviderLogo';

import { LoginButton } from './LoginButton';
import { getOauthURL } from './utils';

export const OauthLoginButton = ({ provider }) => (
  <LoginButton
    image={<IdentityProviderLogo name={provider.provider} />}
    label={provider.label}
    onClick={() => {
      window.location.href = getOauthURL(provider);
    }}
  />
);
