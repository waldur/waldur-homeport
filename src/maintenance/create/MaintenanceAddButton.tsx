import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

import { MAINTENANCE_ANNOUNCEMENT_FORM_ID } from '../utils';

const MaintenanceFormDialog = lazyComponent(() =>
  import('./MaintenanceFormDialog').then((module) => ({
    default: module.MaintenanceFormDialog,
  })),
);

export const MaintenanceAddButton = ({ provider, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () =>
      dispatch(
        openModalDialog(MaintenanceFormDialog, {
          resolve: { provider, refetch },
          size: 'lg',
          formId: MAINTENANCE_ANNOUNCEMENT_FORM_ID,
        }),
      ),
    [dispatch, refetch],
  );

  return <AddButton action={callback} />;
};
