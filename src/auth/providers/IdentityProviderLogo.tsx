import WaldurLogo from '@waldur/images/logo.svg';

import { EDUTEAMS_IDP, KEYCLOAK_IDP, SAML2_IDP, TARA_IDP } from './constants';
import EduteamsLogo from './EduteamsLogo.png';
import KeycloakLogo from './KeycloakLogo.svg';
import Saml2Logo from './Saml2Logo.svg';
import TaraLogo from './TaraLogo.svg';

const LogoMap = {
  [EDUTEAMS_IDP]: (props) => (
    <img src={EduteamsLogo} alt="eduteams" {...props} />
  ),
  [TARA_IDP]: TaraLogo,
  [KEYCLOAK_IDP]: KeycloakLogo,
  [SAML2_IDP]: Saml2Logo,
  waldur: WaldurLogo,
};

export const IdentityProviderLogo = ({ name }) => {
  const Logo = LogoMap[name] || LogoMap.waldur;
  return <Logo style={{ width: '100%', maxHeight: 40 }} />;
};
