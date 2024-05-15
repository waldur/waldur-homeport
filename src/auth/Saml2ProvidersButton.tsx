import { Globe } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { LoginButton } from './LoginButton';

const AuthSaml2Dialog = lazyComponent(
  () => import('./saml2/AuthSaml2Dialog'),
  'AuthSaml2Dialog',
);

export const Saml2ProvidersButton = () => {
  const dispatch = useDispatch();

  return (
    <LoginButton
      icon={<Globe />}
      label="eduGAIN"
      onClick={() => dispatch(openModalDialog(AuthSaml2Dialog))}
    />
  );
};
