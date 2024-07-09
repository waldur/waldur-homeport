import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { deleteOfferingImage } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

export const DeleteImageButton = ({ row }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the image?'),
      );
    } catch {
      return;
    }
    try {
      await deleteOfferingImage(row.uuid);
      dispatch(showSuccess(translate('Image has been removed.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to remove image.')));
    }
  };
  if (
    !hasPermission(user, {
      permission: PermissionEnum.DELETE_OFFERING_SCREENSHOT,
      customerId: row.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <RowActionButton title={translate('Delete')} action={handler} size="sm" />
  );
};
