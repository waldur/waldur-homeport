import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { UserDetails } from '@waldur/workspace/types';

const UserEmailChangeDialog = lazyComponent(
  () => import('./UserEmailChangeDialog'),
  'UserEmailChangeDialog',
);

interface ChangeEmailButtonProps {
  user: UserDetails;
  protected: boolean;
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
      iconNode={<PencilSimple weight="bold" />}
      action={openChangeEmailDialog}
      variant="secondary"
      className="btn-sm btn-icon"
    />
  );
};
