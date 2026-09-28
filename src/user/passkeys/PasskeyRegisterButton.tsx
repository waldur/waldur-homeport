import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      label={translate('Add passkey')}
      onClick={openFormDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      data-testid="passkey-add"
      size="lg"
    />
  );
};
