import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { User } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

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
      disabledReason={translate('Profile editing is currently disabled')}
    />
  );
};
