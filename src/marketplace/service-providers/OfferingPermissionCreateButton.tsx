import { PlusCircleIcon } from '@phosphor-icons/react';
import React from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';

const OfferingPermissionCreateDialog = lazyComponent(() =>
  import('./permissions/OfferingPermissionCreateDialog').then((module) => ({
    default: module.OfferingPermissionCreateDialog,
  })),
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
    <BaseButton
      onClick={callback}
      label={translate('Add user')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  ) : null;
};
