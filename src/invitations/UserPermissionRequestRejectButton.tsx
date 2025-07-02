import { ProhibitIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { userPermissionRequestsReject } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface UserPermissionRequestRejectButtonProps {
  permissionRequest: any;
  refetch;
}

const PermissionRequestActionDialog = lazyComponent(() =>
  import('./PermissionRequestActionDialog').then((module) => ({
    default: module.PermissionRequestActionDialog,
  })),
);

const openPermissionRequestActionDialog = (resolve) =>
  openModalDialog(PermissionRequestActionDialog, {
    resolve,
    size: 'lg',
  });

export const UserPermissionRequestRejectButton: FunctionComponent<
  UserPermissionRequestRejectButtonProps
> = ({ permissionRequest, refetch }) => {
  const dispatch = useDispatch();

  const submitRequest = async (comment: string) => {
    try {
      await userPermissionRequestsReject({
        path: { uuid: permissionRequest.uuid },
        body: { comment },
      });
      dispatch(showSuccess(translate('Permission request has been rejected.')));
      dispatch(closeModalDialog());
      refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to reject permission request.')),
      );
    }
  };

  const callback = () => {
    dispatch(
      openPermissionRequestActionDialog({
        title: translate('Reject permission request by {name}', {
          name: permissionRequest.created_by_full_name,
        }),
        submitRequest,
      }),
    );
  };

  return (
    <ActionButton
      action={callback}
      title={translate('Reject')}
      iconNode={<ProhibitIcon />}
    />
  );
};
