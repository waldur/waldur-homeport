import { marketplaceScreenshotsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

export const DeleteImageAction = ({ row, refetch, offering }) => {
  const user = useUser();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceScreenshotsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Image has been removed.'),
    errorMessage: translate('Unable to remove image.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete the image?'),
      options: { forDeletion: true },
    },
  });

  if (
    !hasPermission(user, {
      permission: PermissionEnum.DELETE_OFFERING_SCREENSHOT,
      customerId: row.customer_uuid,
    }) ||
    offering.type === REMOTE_OFFERING_TYPE
  ) {
    return null;
  }

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
