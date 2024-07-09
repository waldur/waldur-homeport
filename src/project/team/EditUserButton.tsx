import { PencilSimple } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { GenericPermission } from '@waldur/permissions/types';
import { RowActionButton } from '@waldur/table/ActionButton';
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
  return (
    <RowActionButton
      action={callback}
      title={translate('Edit')}
      iconNode={<PencilSimple />}
      size="sm"
    />
  );
};
