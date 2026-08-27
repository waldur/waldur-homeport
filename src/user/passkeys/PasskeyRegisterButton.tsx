import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const PasskeyRegisterDialog = lazyComponent(() =>
  import('./PasskeyRegisterDialog').then((module) => ({
    default: module.PasskeyRegisterDialog,
  })),
);

export const PasskeyRegisterButton: FunctionComponent<{ refetch? }> = ({
  refetch,
}) => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () => openDialog(PasskeyRegisterDialog, { resolve: { refetch } }),
    [openDialog, refetch],
  );

  return (
    <ActionButton
      title={translate('Add passkey')}
      action={openFormDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      data-testid="passkey-add"
    />
  );
};
