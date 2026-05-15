import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { marketplaceProviderOfferingsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

import { DRAFT } from '../store/constants';

interface DeleteOfferingActionProps {
  offering: any;
  canManageOfferingLifecycle: boolean;
}

export const DeleteOfferingAction: FC<DeleteOfferingActionProps> = ({
  offering,
  canManageOfferingLifecycle,
}) => {
  const user = useUser();
  const router = useRouter();

  const { mutate: deleteOffering, isPending } = useManagedMutation({
    mutationFn: () =>
      marketplaceProviderOfferingsDestroy({ path: { uuid: offering.uuid } }),
    successMessage: translate('Offering {name} deleted successfully.', {
      name: offering.name,
    }),
    errorMessage: translate('Error while deleting offering {name}.', {
      name: offering.name,
    }),
    onSuccess: () => {
      router.stateService.go('marketplace-vendor-offerings', {
        uuid: offering.customer_uuid,
      });
    },
    confirmation: {
      title: translate('Delete confirmation'),
      body: translate('Are you sure you want to delete offering {name}?', {
        name: offering.name,
      }),
      options: { forDeletion: true },
    },
  });

  const canDeleteOffering = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING,
    customerId: offering.customer_uuid,
  });

  const showDeleteAction = canManageOfferingLifecycle
    ? user.is_staff ||
      (offering.state === DRAFT &&
        !offering.resources_count &&
        canDeleteOffering)
    : false;

  if (!showDeleteAction) {
    return null;
  }

  const deletionRestricted =
    offering.plugin_options?.restrict_deletion_with_active_resources &&
    offering.resources_count > 0;

  return (
    <>
      <div className="separator my-2" />
      <RemovalActionItem
        title={translate('Delete')}
        action={() => deleteOffering()}
        disabled={isPending || !!deletionRestricted}
        tooltip={
          deletionRestricted
            ? translate(
                'Offering cannot be deleted while it has active resources.',
              )
            : undefined
        }
      />
    </>
  );
};
