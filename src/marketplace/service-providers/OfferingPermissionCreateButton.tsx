import { PlusCircleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

const OfferingPermissionCreateDialog = lazyComponent(() =>
  import('../offerings/details/permissions/OfferingPermissionCreateDialog').then(
    (module) => ({
      default: module.OfferingPermissionCreateDialog,
    }),
  ),
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
      openModalDialog(OfferingPermissionCreateDialog, {
        resolve: { refetch: fetch },
      }),
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
