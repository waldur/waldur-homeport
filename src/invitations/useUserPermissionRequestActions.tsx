import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  userPermissionRequestsApprove,
  userPermissionRequestsReject,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog, waitForConfirmation } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const useUserPermissionRequestActions = (permissionRequest, refetch) => {
  const dispatch = useDispatch();

  const approveRequest = async (
    comment?: string,
    hasConfirmation?: boolean,
  ) => {
    try {
      if (hasConfirmation) {
        await waitForConfirmation(
          dispatch,
          translate('Approve permission request by {name}', {
            name: permissionRequest.created_by_full_name,
          }),
          null,
          {
            type: 'success',
            size: 'sm',
            positiveButton: translate('Approve'),
            negativeButton: translate('Cancel'),
            iconNode: <CheckCircleIcon weight="bold" />,
          },
        );
      }

      await userPermissionRequestsApprove({
        path: { uuid: permissionRequest.uuid },
        body: comment ? { comment } : undefined,
      });
      dispatch(showSuccess(translate('Permission request has been approved.')));
      dispatch(closeModalDialog());
      refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to approve permission request.'),
        ),
      );
    }
  };

  const rejectRequest = async (comment?: string, hasConfirmation?: boolean) => {
    try {
      if (hasConfirmation) {
        await waitForConfirmation(
          dispatch,
          translate('Decline permission request by {name}', {
            name: permissionRequest.created_by_full_name,
          }),
          null,
          {
            type: 'danger',
            size: 'sm',
            positiveButton: translate('Decline'),
            negativeButton: translate('Cancel'),
            positiveButtonVariant: 'danger',
            iconNode: <XCircleIcon weight="bold" />,
          },
        );
      }

      await userPermissionRequestsReject({
        path: { uuid: permissionRequest.uuid },
        body: comment ? { comment } : undefined,
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

  return { approveRequest, rejectRequest };
};
