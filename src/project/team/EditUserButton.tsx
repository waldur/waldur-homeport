import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { GenericPermission } from '@waldur/permissions/types';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

const EditUserDialog = lazyComponent(
  () => import('./EditUserDialog'),
  'EditUserDialog',
);

interface EditUserButtonProps {
  permission: GenericPermission;
  refetch;
}

export const EditUserButton: React.FC<EditUserButtonProps> = ({
  permission,
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const project = useSelector(getProject);
  const customer = useSelector(getCustomer);

  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT_PERMISSION,
      customerId: customer.uuid,
      projectId: project.uuid,
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
        },
      }),
    );
  return <EditButton onClick={callback} size="sm" />;
};
