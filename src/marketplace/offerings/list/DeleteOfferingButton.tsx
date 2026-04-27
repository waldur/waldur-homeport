import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsDestroy } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

export const DeleteOfferingButton = ({ row, refetch }) => {
  const user = useUser();
  const dispatch = useDispatch();

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

  const isNotDraft = row.state !== 'Draft';
  // Staff can delete non-draft offerings; non-staff cannot
  const disabled = isNotDraft && !user.is_staff;

  const handleDeleteConfirmation = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete confirmation'),
        translate('Are you sure you want to delete this offering?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await marketplaceProviderOfferingsDestroy({ path: { uuid: row.uuid } });
      dispatch(showSuccess(translate('Offering deleted successfully.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Error while deleting offering.')),
      );
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={handleDeleteConfirmation}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={disabled}
      tooltip={
        disabled ? translate('Only draft offerings can be deleted') : undefined
      }
      staff={isNotDraft && user.is_staff}
    />
  );
};
