import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const OrganizationGroupForm = lazyComponent(() =>
  import('./OrganizationGroupForm').then((module) => ({
    default: module.OrganizationGroupForm,
  })),
);

export const OrganizationGroupEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(OrganizationGroupForm, {
          resolve: { organizationGroup: row, refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <EditAction action={openFormDialog} size="sm" />;
};
