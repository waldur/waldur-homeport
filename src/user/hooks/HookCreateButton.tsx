import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      label={translate('Add notification')}
      onClick={() =>
        openDialog(HookDetailsDialog, {
          resolve: props,
          size: 'lg',
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
