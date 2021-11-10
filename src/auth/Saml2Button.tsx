import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';

import { LoginButton } from './LoginButton';
import { loginSaml2Action } from './saml2/store/actions';

export const Saml2Button = () => {
  const dispatch = useDispatch();

  return (
    <LoginButton
      iconClass="fa-university"
      label={ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_LABEL}
      onClick={() =>
        dispatch(
          loginSaml2Action(ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL),
        )
      }
    />
  );
};
