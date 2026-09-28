import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      label={translate('Add key')}
      onClick={openFormDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
