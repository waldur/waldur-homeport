import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const HookDetailsDialog = lazyComponent(() =>
  import('./HookDetailsDialog').then((module) => ({
    default: module.HookDetailsDialog,
  })),
);

export const HookCreateButton: FunctionComponent<{ refetch; hook? }> = (
  props,
) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('Add notification')}
      action={() =>
        openDialog(HookDetailsDialog, {
          resolve: props,
          size: 'lg',
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
