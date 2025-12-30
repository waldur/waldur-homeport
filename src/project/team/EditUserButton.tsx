import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { GenericPermission } from '@waldur/permissions/types';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

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
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const currentProject = useSelector(getProject);
  const customer = useSelector(getCustomer);

  const hasContext = projectUuid || customerUuid;
  const projectId = hasContext ? projectUuid : currentProject?.uuid;
  const customerId = hasContext ? customerUuid : customer?.uuid;

  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT_PERMISSION,
      customerId,
      projectId,
    })
  ) {
    return null;
  }

  const callback = () =>
    dispatch(
      openModalDialog(EditUserDialog, {
        resolve: {
          permission,
          refetch,
          projectUuid,
          customerUuid,
          project,
        },
      }),
    );
  return <EditAction action={callback} size="sm" />;
};
