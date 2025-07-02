import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { User } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const UserEmailChangeDialog = lazyComponent(() =>
  import('./UserEmailChangeDialog').then((module) => ({
    default: module.UserEmailChangeDialog,
  })),
);

interface ChangeEmailButtonProps {
  user: User;
  protected?: boolean;
  disabled?: boolean;
}

export const ChangeEmailButton: FunctionComponent<ChangeEmailButtonProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const openChangeEmailDialog = useCallback(() => {
    dispatch(
      openModalDialog(UserEmailChangeDialog, {
        resolve: { user: props.user, isProtected: props.protected },
        size: 'sm',
      }),
    );
  }, [dispatch, props.user]);
  return (
    <ActionButton
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openChangeEmailDialog}
      variant="secondary"
      className="btn-sm btn-icon"
      disabled={props.disabled}
    />
  );
};
