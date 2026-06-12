import { FC } from 'react';
import {
  marketplaceOfferingUsersDestroy,
  OfferingUser,
  ServiceProvider,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

export const ProviderOfferingUserDeleteButton: FC<{
  row: OfferingUser;
  provider?: ServiceProvider;
  offering?: any;
  refetch;
}> = (props) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingUsersDestroy({ path: { uuid: props.row.uuid } }),
    successMessage: translate('Offering user has been deleted.'),
    errorMessage: translate('Unable to delete offering user.'),
    refetch: props.refetch,
    confirmation: {
      title: translate('Delete offering user'),
      body: translate(
        'Are you sure you want to delete offering user {username}?',
        {
          username: props.row.username,
        },
      ),
      options: { forDeletion: true },
    },
  });

  const user = useUser();
  const canDeleteOfferingUser = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING_USER,
    customerId: props.provider
      ? props.provider.customer_uuid
      : props.offering
        ? props.offering.customer_uuid
        : props.row.customer_uuid, // Use row's customer_uuid for admin context
  });

  return (
    canDeleteOfferingUser && (
      <RemovalActionItem
        title={translate('Delete')}
        action={mutate}
        disabled={isPending}
      />
    )
  );
};
