import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { User } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CompactActionButton } from '@/table/CompactActionButton';

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
  const { openDialog } = useModal();
  const openChangeEmailDialog = useCallback(() => {
    openDialog(UserEmailChangeDialog, {
      resolve: { user: props.user, isProtected: props.protected },
      size: 'sm',
    });
  }, [props.user, props.protected]);
  return (
    <CompactActionButton
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openChangeEmailDialog}
      variant="secondary"
      className="btn-icon"
      disabled={props.disabled}
      disabledReason={translate('Profile editing is currently disabled')}
    />
  );
};
