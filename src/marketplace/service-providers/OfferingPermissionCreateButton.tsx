import { PlusCircleIcon } from '@phosphor-icons/react';
import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser, useCustomer } from '@/workspace/hooks';

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
  const customer = useCustomer();
  const canCreatePermission = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING_PERMISSION,
    customerId: customer.uuid,
  });
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(OfferingPermissionCreateDialog, {
      resolve: { refetch: fetch },
    });
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
