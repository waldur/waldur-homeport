import { useCallback } from 'react';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { MAINTENANCE_ANNOUNCEMENT_FORM_ID } from '../utils';

const MaintenanceFormDialog = lazyComponent(() =>
  import('./MaintenanceFormDialog').then((module) => ({
    default: module.MaintenanceFormDialog,
  })),
);

export const MaintenanceAddButton = ({ provider, refetch }) => {
  const { openDialog } = useModal();
  const callback = useCallback(
    () =>
      openDialog(MaintenanceFormDialog, {
        resolve: { provider, refetch },
        size: 'lg',
        formId: MAINTENANCE_ANNOUNCEMENT_FORM_ID,
      }),
    [refetch],
  );

  return <AddButton action={callback} />;
};
