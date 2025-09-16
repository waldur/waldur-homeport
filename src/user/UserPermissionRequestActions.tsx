import { XCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { userPermissionRequestsCancelRequest } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

const UserPermissionRequestCancel = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to cancel this request?'),
        { forDeletion: true, size: 'sm' },
      );
    } catch {
      return;
    }

    try {
      await userPermissionRequestsCancelRequest({ path: { uuid: row.uuid } });
      refetch();
      dispatch(showSuccess(translate('Request canceled')));
      refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to cancel this request.')),
      );
    }
  };
  return (
    <ActionItem
      title={translate('Cancel')}
      action={callback}
      iconNode={<XCircleIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};

export const UserPermissionRequestActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[UserPermissionRequestCancel]}
    />
  );
};
