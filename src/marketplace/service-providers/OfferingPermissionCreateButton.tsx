import { PlusCircleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

const OfferingPermissionCreateDialog = lazyComponent(() =>
  import('./OfferingPermissionCreateDialog').then((module) => ({
    default: module.OfferingPermissionCreateDialog,
  })),
);

export const OfferingPermissionCreateButton: React.FC<{ fetch }> = ({
  fetch,
}) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const canCreatePermission = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING_PERMISSION,
    customerId: customer.uuid,
  });
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(OfferingPermissionCreateDialog, { resolve: { fetch } }),
    );
  };
  return canCreatePermission ? (
    <ActionButton
      action={callback}
      title={translate('Add user')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  ) : null;
};
