import { StudentIcon } from '@phosphor-icons/react';

import { ENV } from '@waldur/core/config';

import { LoginButton } from './LoginButton';
import { useSaml2 } from './saml2/hooks';

export const Saml2Button = () => {
  const handleSaml2Login = useSaml2();

  return (
    <LoginButton
      icon={<StudentIcon />}
      label={ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_LABEL}
      onClick={() =>
        handleSaml2Login(ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL)
      }
    />
  );
};
