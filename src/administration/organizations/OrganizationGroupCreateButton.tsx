import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const OrganizationGroupForm = lazyComponent(() =>
  import('./OrganizationGroupForm').then((module) => ({
    default: module.OrganizationGroupForm,
  })),
);

export const OrganizationGroupCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(OrganizationGroupForm, {
          resolve: { refetch },
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openFormDialog} />;
};
