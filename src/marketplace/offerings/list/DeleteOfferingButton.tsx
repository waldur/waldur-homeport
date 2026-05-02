import { marketplaceProviderOfferingsDestroy } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

export const DeleteOfferingButton = ({ row, refetch }) => {
  const user = useUser();

  const canManageOfferingLifecycle =
    user.is_staff ||
    !!ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT;

  const canDeleteOffering = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING,
    customerId: row.customer_uuid,
  });

  // Hide when user permanently lacks permission
  if (!canManageOfferingLifecycle || !canDeleteOffering) {
    return null;
  }

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsDestroy({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Delete confirmation'),
      body: translate('Are you sure you want to delete this offering?'),
      options: { forDeletion: true },
    },
    successMessage: translate('Offering deleted successfully.'),
    errorMessage: translate('Error while deleting offering.'),
    refetch,
  });

  const isNotDraft = row.state !== 'Draft';
  // Staff can delete non-draft offerings; non-staff cannot
  const disabled = (isNotDraft && !user.is_staff) || isPending;

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={disabled}
      tooltip={
        disabled ? translate('Only draft offerings can be deleted') : undefined
      }
      staff={isNotDraft && user.is_staff}
    />
  );
};
