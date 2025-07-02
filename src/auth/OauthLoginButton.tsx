import { IdentityProvider } from 'waldur-js-client';

import { IdentityProviderLogo } from '@waldur/auth/providers/IdentityProviderLogo';

import { LoginButton } from './LoginButton';
import { getOauthURL } from './utils';

export const OauthLoginButton = ({
  provider,
}: {
  provider: Pick<IdentityProvider, 'label' | 'provider'>;
}) => (
  <LoginButton
    image={<IdentityProviderLogo name={provider.provider} maxHeight={40} />}
    label={provider.label}
    onClick={() => {
      window.location.href = getOauthURL(provider);
    }}
  />
);
