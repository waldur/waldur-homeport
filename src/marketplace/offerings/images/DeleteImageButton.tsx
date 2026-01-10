import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceScreenshotsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

export const DeleteImageAction = ({ row, refetch, offering }) => {
  const user = useUser();
  const dispatch = useDispatch();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the image?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await marketplaceScreenshotsDestroy({ path: { uuid: row.uuid } });
      refetch();
      dispatch(showSuccess(translate('Image has been removed.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to remove image.')));
    }
  };

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
    <ActionItem
      title={translate('Delete')}
      action={handler}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );
};
