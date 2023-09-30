import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteOfferingPermission } from '@waldur/permissions/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface OfferingPermissionRemoveButtonProps {
  permission: any;
  fetch;
}

export const OfferingPermissionRemoveButton: React.FC<OfferingPermissionRemoveButtonProps> =
  (props) => {
    const dispatch = useDispatch();
    const callback = async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to revoke this permission?'),
        );
      } catch {
        return;
      }
      try {
        await deleteOfferingPermission({
          offering: props.permission.offering_uuid,
          user: props.permission.user_uuid,
          role: props.permission.role_name,
        });
        dispatch(showSuccess(translate('Permission has been revoked.')));
        await props.fetch();
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to revoke permission.')),
        );
      }
    };
    return (
      <ActionButton
        action={callback}
        title={translate('Revoke')}
        icon="fa fa-trash"
      />
    );
  };
