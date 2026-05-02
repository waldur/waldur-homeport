import React from 'react';
import { useSelector } from 'react-redux';
import { marketplaceProviderOfferingsDeleteUser } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

interface OfferingPermissionRemoveButtonProps {
  row: any;
  refetch;
}

export const OfferingPermissionRemoveButton: React.FC<
  OfferingPermissionRemoveButtonProps
> = (props) => {
  const user = useUser();
  const customer = useSelector(getCustomer);

  const canDeletePermission = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING_PERMISSION,
    customerId: customer.uuid,
  });

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsDeleteUser({
        path: { uuid: props.row.offering_uuid },
        body: {
          user: props.row.user_uuid,
          role: props.row.role_name,
        },
      }),
    successMessage: translate('Permission has been revoked.'),
    errorMessage: translate('Unable to revoke permission.'),
    refetch: props.refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to revoke this permission?'),
    },
  });
  return canDeletePermission ? (
    <RemovalActionItem
      action={mutate}
      disabled={isPending}
      title={translate('Revoke')}
    />
  ) : null;
};
