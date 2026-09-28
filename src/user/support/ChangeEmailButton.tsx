import { FunctionComponent, useCallback } from 'react';
import { User } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <CompactEditButton
      onClick={openChangeEmailDialog}
      variant="secondary"
      disabled={props.disabled}
      disabledReason={translate('Profile editing is currently disabled')}
      data-testid="change-email-btn"
    />
  );
};
