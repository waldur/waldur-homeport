import React from 'react';

import { ENV } from '@waldur/core/config';
import WaldurLogo from '@waldur/images/logo.svg';

import {
  EDUTEAMS_IDP,
  FREEIPA_IDP,
  KEYCLOAK_IDP,
  SAML2_IDP,
  TARA_IDP,
} from './constants';
import EduteamsLogo from './EduteamsLogo.png';
import FreeipaLogo from './FreeipaLogo.png';
import KeycloakLogo from './KeycloakLogo.svg';
import Saml2Logo from './Saml2Logo.svg';
import TaraLogo from './TaraLogo.svg';

const KeycloakLogoComponent = (props) => {
  const iconUrl = ENV.plugins.WALDUR_CORE.KEYCLOAK_ICON;
  const [useDefault, setUseDefault] = React.useState(!iconUrl);

  if (useDefault) {
    return <KeycloakLogo {...props} />;
  }

  return (
    <img
      src={iconUrl}
      alt="Keycloak"
      onError={() => setUseDefault(true)}
      {...props}
    />
  );
};

const LogoMap = {
  [EDUTEAMS_IDP]: (props) => (
    <img src={EduteamsLogo} alt="eduteams" {...props} />
  ),

  [FREEIPA_IDP]: (props) => <img src={FreeipaLogo} alt="freeipa" {...props} />,
  [TARA_IDP]: TaraLogo,
  [KEYCLOAK_IDP]: KeycloakLogoComponent,
  [SAML2_IDP]: Saml2Logo,
  waldur: WaldurLogo,
};

export const IdentityProviderLogo = ({ name, maxHeight = undefined }) => {
  const Logo = LogoMap[name] || LogoMap.waldur;
  return <Logo style={{ width: '100%', maxHeight }} />;
};
