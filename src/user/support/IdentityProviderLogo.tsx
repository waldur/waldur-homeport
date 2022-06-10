import { ENV } from '@waldur/configs/default';

const EduteamsLogo = require('@waldur/auth/EduteamsLogo.png');
const KeycloakLogo = require('@waldur/auth/KeycloakLogo.svg');
const MyAccessIdLogo = require('@waldur/auth/MyaccessidLogo.svg');
const Saml2Logo = require('@waldur/auth/Saml2Logo.svg');
const SmartidLogo = require('@waldur/auth/SmartidLogo.svg');
const TaraLogo = require('@waldur/auth/TaraLogo.svg');
const WaldurLogo = require('@waldur/images/logo.svg');

export const IdentityProviderLogo = ({ name }) => {
  if (name === 'eduteams') {
    return ENV.plugins.WALDUR_AUTH_SOCIAL.EDUTEAMS_LABEL === 'MyAccessID' ? (
      <img src={MyAccessIdLogo} />
    ) : (
      <img src={EduteamsLogo} />
    );
  } else if (name === 'smartid.ee') {
    return <img src={SmartidLogo} />;
  } else if (name === 'tara') {
    return <img src={TaraLogo} />;
  } else if (name === 'keycloak') {
    return <img src={KeycloakLogo} />;
  } else if (name === 'saml2') {
    return <img src={Saml2Logo} />;
  } else {
    return <img src={WaldurLogo} />;
  }
};
