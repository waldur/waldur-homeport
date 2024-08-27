import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const OrganizationGroupEditDialog = lazyComponent(
  () => import('./OrganizationGroupFromDialog'),
  'OrganizationGroupFromDialog',
);

const organizationGroupEditDialog = (row, refetch) =>
  openModalDialog(OrganizationGroupEditDialog, {
    resolve: { organizationGroup: row, refetch },
    size: 'md',
  });

export const OrganizationGroupEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(organizationGroupEditDialog(row, refetch)),
    [dispatch],
  );

  return <EditButton onClick={openFormDialog} size="sm" />;
};
