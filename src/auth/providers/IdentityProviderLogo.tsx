import { EDUTEAMS_IDP, KEYCLOAK_IDP, SAML2_IDP, TARA_IDP } from './constants';

const WaldurLogo = require('@waldur/images/logo.svg');

const EduteamsLogo = require('./EduteamsLogo.png');
const KeycloakLogo = require('./KeycloakLogo.svg');
const Saml2Logo = require('./Saml2Logo.svg');
const TaraLogo = require('./TaraLogo.svg');

export const IdentityProviderLogo = ({ name }) => {
  if (name === EDUTEAMS_IDP) {
    return <img src={EduteamsLogo} style={{ width: '100%' }} />;
  } else if (name === TARA_IDP) {
    return <img src={TaraLogo} style={{ width: '100%' }} />;
  } else if (name === KEYCLOAK_IDP) {
    return <img src={KeycloakLogo} style={{ width: '100%' }} />;
  } else if (name === SAML2_IDP) {
    return <img src={Saml2Logo} style={{ width: '100%' }} />;
  } else {
    return <img src={WaldurLogo} style={{ width: '100%' }} />;
  }
};
