import { XCircleIcon } from '@phosphor-icons/react';
import { userPermissionRequestsCancelRequest } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const UserPermissionRequestCancel = ({ row, refetch }) => {
  const cancelMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      userPermissionRequestsCancelRequest({ path: { uuid: row.uuid } }),
    successMessage: translate('Request canceled'),
    errorMessage: translate('Unable to cancel this request.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to cancel this request?'),
      options: { forDeletion: true, size: 'sm' },
    },
  });
  return (
    <ActionItem
      title={translate('Cancel')}
      action={() => cancelMutation.mutate()}
      disabled={cancelMutation.isPending}
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
