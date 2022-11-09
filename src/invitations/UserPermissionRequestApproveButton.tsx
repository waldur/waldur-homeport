import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { approvePermissionRequest } from '@waldur/invitations/api';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface UserPermissionRequestApproveButtonProps {
  permissionRequest: any;
  refreshList;
}

const PermissionRequestActionDialog = lazyComponent(
  () => import('./PermissionRequestActionDialog'),
  'PermissionRequestActionDialog',
);

const openPermissionRequestActionDialog = (resolve) =>
  openModalDialog(PermissionRequestActionDialog, {
    resolve,
    size: 'md',
  });

export const UserPermissionRequestApproveButton: FunctionComponent<UserPermissionRequestApproveButtonProps> =
  ({ permissionRequest, refreshList }) => {
    const dispatch = useDispatch();

    const submitRequest = async (comment: string) => {
      try {
        await approvePermissionRequest(permissionRequest.uuid, comment);
        dispatch(
          showSuccess(translate('Permission request has been approved.')),
        );
        dispatch(closeModalDialog());
        refreshList();
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to approve permission request.'),
          ),
        );
      }
    };

    const callback = () => {
      dispatch(
        openPermissionRequestActionDialog({
          title: translate('Approve permission request by {name}', {
            name: permissionRequest.created_by_full_name,
          }),
          submitRequest,
        }),
      );
    };

    return (
      <ActionButton
        action={callback}
        title={translate('Approve')}
        icon="fa fa-check"
      />
    );
  };
