import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import {
  userPermissionRequestsApprove,
  userPermissionRequestsReject,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const useApprovePermissionRequest = (
  permissionRequest,
  refetch,
  { confirm = false } = {},
) => {
  const { mutateAsync, isPending } = useManagedMutation<
    any,
    any,
    { comment?: string }
  >({
    mutationFn: (variables) =>
      userPermissionRequestsApprove({
        path: { uuid: permissionRequest.uuid },
        body: variables.comment ? { comment: variables.comment } : undefined,
      }),
    confirmation: confirm
      ? {
          title: translate('Approve permission request by {name}', {
            name: permissionRequest.created_by_full_name,
          }),
          body: null,
          options: {
            type: 'success',
            size: 'sm',
            positiveButton: translate('Approve'),
            negativeButton: translate('Cancel'),
            iconNode: <CheckCircleIcon weight="bold" />,
          },
        }
      : undefined,
    successMessage: translate('Permission request has been approved.'),
    errorMessage: translate('Unable to approve permission request.'),
    refetch,
  });

  const approveRequest = (comment?: string) => mutateAsync({ comment });

  return { approveRequest, isPending };
};

export const useRejectPermissionRequest = (
  permissionRequest,
  refetch,
  { confirm = false } = {},
) => {
  const { mutateAsync, isPending } = useManagedMutation<
    any,
    any,
    { comment?: string }
  >({
    mutationFn: (variables) =>
      userPermissionRequestsReject({
        path: { uuid: permissionRequest.uuid },
        body: variables.comment ? { comment: variables.comment } : undefined,
      }),
    confirmation: confirm
      ? {
          title: translate('Decline permission request by {name}', {
            name: permissionRequest.created_by_full_name,
          }),
          body: null,
          options: {
            type: 'danger',
            size: 'sm',
            positiveButton: translate('Decline'),
            negativeButton: translate('Cancel'),
            positiveButtonVariant: 'danger',
            iconNode: <XCircleIcon weight="bold" />,
          },
        }
      : undefined,
    successMessage: translate('Permission request has been rejected.'),
    errorMessage: translate('Unable to reject permission request.'),
    refetch,
  });

  const rejectRequest = (comment?: string) => mutateAsync({ comment });

  return { rejectRequest, isPending };
};
