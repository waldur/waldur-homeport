import { GlobeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { LoginButton } from './LoginButton';

const AuthSaml2Dialog = lazyComponent(() =>
  import('./saml2/AuthSaml2Dialog').then((module) => ({
    default: module.AuthSaml2Dialog,
  })),
);

export const Saml2ProvidersButton = () => {
  const { openDialog } = useModal();

  return (
    <LoginButton
      icon={<GlobeIcon weight="bold" />}
      label="eduGAIN"
      onClick={() => openDialog(AuthSaml2Dialog)}
    />
  );
};
