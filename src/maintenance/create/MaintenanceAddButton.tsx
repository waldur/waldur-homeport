import { FC, useCallback } from 'react';
import { ServiceProvider } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { MAINTENANCE_ANNOUNCEMENT_FORM_ID } from '../utils';

const MaintenanceFormDialog = lazyComponent(() =>
  import('./MaintenanceFormDialog').then((module) => ({
    default: module.MaintenanceFormDialog,
  })),
);

interface MaintenanceAddButtonProps {
  provider?: ServiceProvider;
  refetch?(): void;
}

export const MaintenanceAddButton: FC<MaintenanceAddButtonProps> = ({
  provider,
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = useCallback(
    () =>
      openDialog(MaintenanceFormDialog, {
        resolve: { provider, refetch },
        size: 'lg',
        formId: MAINTENANCE_ANNOUNCEMENT_FORM_ID,
      }),
    [openDialog, provider, refetch],
  );

  return <AddButton action={callback} />;
};
