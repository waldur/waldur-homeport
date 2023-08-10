import { OauthLoginButton } from './OauthLoginButton';
import { Saml2Button } from './Saml2Button';
import { Saml2DiscoveryButton } from './Saml2DiscoveryButton';
import { Saml2ProvidersButton } from './Saml2ProvidersButton';
import { ValimoButton } from './ValimoButton';

export const IdentityProviderSelector = ({ features, providers }) => (
  <>
    {providers.map((provider) => (
      <OauthLoginButton key={provider.provider} provider={provider} />
    ))}
    {features.saml2 && <Saml2Button />}
    {features.saml2providers && <Saml2ProvidersButton />}
    {features.saml2discovery && <Saml2DiscoveryButton />}
    {features.valimo && <ValimoButton />}
  </>
);
