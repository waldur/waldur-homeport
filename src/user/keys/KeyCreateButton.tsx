import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const KeyCreateDialog = lazyComponent(() =>
  import('./KeyCreateDialog').then((module) => ({
    default: module.KeyCreateDialog,
  })),
);

export const KeyCreateButton: FunctionComponent = () => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () => openDialog(KeyCreateDialog, { size: 'lg' }),
    [openDialog],
  );

  return (
    <ActionButton
      title={translate('Add key')}
      action={openFormDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
