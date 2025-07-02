import { DeviceMobileIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { LoginButton } from './LoginButton';

const AuthValimoDialog = lazyComponent(() =>
  import('./valimo/AuthValimoDialog').then((module) => ({
    default: module.AuthValimoDialog,
  })),
);

export const ValimoButton = () => {
  const dispatch = useDispatch();
  return (
    <LoginButton
      icon={<DeviceMobileIcon />}
      label={ENV.plugins.WALDUR_AUTH_VALIMO.LABEL}
      onClick={() => dispatch(openModalDialog(AuthValimoDialog))}
    />
  );
};
