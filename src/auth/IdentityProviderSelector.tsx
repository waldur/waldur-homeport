import { EduteamsButton } from './EduteamsButton';
import { KeycloakButton } from './KeycloakButton';
import { Saml2Button } from './Saml2Button';
import { Saml2DiscoveryButton } from './Saml2DiscoveryButton';
import { Saml2ProvidersButton } from './Saml2ProvidersButton';
import { SmartidButton } from './SmartidButton';
import { TaraButton } from './TaraButton';
import { ValimoButton } from './ValimoButton';

export const IdentityProviderSelector = ({ features }) => (
  <>
    {features.smartid && <SmartidButton />}
    {features.tara && <TaraButton />}
    {features.keycloak && <KeycloakButton />}
    {features.eduteams && <EduteamsButton />}
    {features.saml2 && <Saml2Button />}
    {features.saml2providers && <Saml2ProvidersButton />}
    {features.saml2discovery && <Saml2DiscoveryButton />}
    {features.valimo && <ValimoButton />}
  </>
);
