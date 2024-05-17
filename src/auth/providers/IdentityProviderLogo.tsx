import WaldurLogo from '@waldur/images/logo.svg';

import { EDUTEAMS_IDP, KEYCLOAK_IDP, SAML2_IDP, TARA_IDP } from './constants';
import EduteamsLogo from './EduteamsLogo.png';
import KeycloakLogo from './KeycloakLogo.svg';
import Saml2Logo from './Saml2Logo.svg';
import TaraLogo from './TaraLogo.svg';

export const IdentityProviderLogo = ({ name }) => {
  if (name === EDUTEAMS_IDP) {
    return <img src={EduteamsLogo} style={{ width: '100%' }} alt={name} />;
  } else if (name === TARA_IDP) {
    return <img src={TaraLogo} style={{ width: '100%' }} alt={name} />;
  } else if (name === KEYCLOAK_IDP) {
    return <img src={KeycloakLogo} style={{ width: '100%' }} alt={name} />;
  } else if (name === SAML2_IDP) {
    return <img src={Saml2Logo} style={{ width: '100%' }} alt={name} />;
  } else {
    return <img src={WaldurLogo} style={{ width: '100%' }} alt={name} />;
  }
};
