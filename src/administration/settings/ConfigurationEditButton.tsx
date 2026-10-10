import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

const ConfigurationEditDialog = lazyComponent(() =>
  import('./ConfigurationEditDialog').then((module) => ({
    default: module.ConfigurationEditDialog,
  })),
);

export const ConfigurationEditButton = ({
  item,
  value,
  disabledReason,
}: {
  item: any;
  value: any;
  disabledReason?: string;
}) => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () =>
      openDialog(ConfigurationEditDialog, {
        resolve: { item, initialValues: { value } },
        size:
          item.key === 'LOGIN_PAGE_LAYOUT' || item.type === 'markdown_field'
            ? 'lg'
            : 'md',
      }),
    [],
  );

  return (
    <CompactEditButton
      onClick={openFormDialog}
      disabled={Boolean(disabledReason)}
      disabledReason={disabledReason}
    />
  );
};
