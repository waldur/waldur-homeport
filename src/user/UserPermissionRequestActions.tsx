import { XCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { userPermissionRequestsCancelRequest } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';

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
