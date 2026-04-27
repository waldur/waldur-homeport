import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceScreenshotsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { waitForConfirmation } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

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
