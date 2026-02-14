import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsDestroy } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

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
