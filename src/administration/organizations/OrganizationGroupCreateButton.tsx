import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const OrganizationGroupCreateDialog = lazyComponent(
  () => import('./OrganizationGroupFromDialog'),
  'OrganizationGroupFromDialog',
);

const organizationGroupCreateDialog = (refetch) =>
  openModalDialog(OrganizationGroupCreateDialog, {
    resolve: { refetch },
    size: 'md',
  });

export const OrganizationGroupCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(organizationGroupCreateDialog(refetch)),
    [dispatch],
  );

  return <AddButton action={openFormDialog} />;
};
