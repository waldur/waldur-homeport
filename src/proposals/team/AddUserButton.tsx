import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionMap } from '@waldur/permissions/enums';
import { checkScope } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { AddUserDialogProps } from './types';

const AddUserDialog = lazyComponent(
  () => import('./AddUserDialog'),
  'AddUserDialog',
);

export const AddUserButton: React.FC<AddUserDialogProps> = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const disabled = !props.roleTypes.some(
    (roleType) =>
      checkScope(user, 'customer', customer.uuid, PermissionMap[roleType]) ||
      checkScope(user, roleType, props.scope.uuid, PermissionMap[roleType]),
  );
  return (
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(AddUserDialog, {
            ...props,
            initialValues:
              props.roles && props.roles.length === 1
                ? { role: props.roles[0] }
                : {},
          }),
        )
      }
      title={translate('Add user')}
      icon="fa fa-plus"
      disabled={disabled}
    />
  );
};
