import { DeviceMobileIcon } from '@phosphor-icons/react';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { LoginButton } from './LoginButton';

const AuthValimoDialog = lazyComponent(() =>
  import('./valimo/AuthValimoDialog').then((module) => ({
    default: module.AuthValimoDialog,
  })),
);

export const ValimoButton = () => {
  const { openDialog } = useModal();
  return (
    <LoginButton
      icon={<DeviceMobileIcon weight="bold" />}
      label={ENV.plugins.WALDUR_AUTH_VALIMO.LABEL}
      onClick={() => openDialog(AuthValimoDialog)}
    />
  );
};
