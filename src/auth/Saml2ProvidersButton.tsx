import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { LoginButton } from './LoginButton';

const AuthSaml2Dialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "AuthSaml2Dialog" */ './saml2/AuthSaml2Dialog'),
  'AuthSaml2Dialog',
);

export const Saml2ProvidersButton = () => {
  const dispatch = useDispatch();

  return (
    <LoginButton
      iconClass="fa-globe"
      label="eduGAIN"
      onClick={() => dispatch(openModalDialog(AuthSaml2Dialog))}
    />
  );
};
