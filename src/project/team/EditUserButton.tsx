import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/actions';
import { GenericPermission } from '@/permissions/types';

const EditUserDialog = lazyComponent(() =>
  import('./EditUserDialog').then((module) => ({
    default: module.EditUserDialog,
  })),
);

interface EditUserButtonProps {
  row: GenericPermission;
  refetch;
  projectUuid?;
  customerUuid?;
  project?;
}

export const EditUserButton: React.FC<EditUserButtonProps> = ({
  row: permission,
  refetch,
  projectUuid,
  customerUuid,
  project,
}) => {
  const { openDialog } = useModal();

  const callback = () =>
    openDialog(EditUserDialog, {
      resolve: {
        permission,
        refetch,
        projectUuid,
        customerUuid,
        project,
      },
    });
  return <EditAction action={callback} size="sm" />;
};
