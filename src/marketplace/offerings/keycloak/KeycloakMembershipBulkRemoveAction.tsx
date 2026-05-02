import { offeringKeycloakMembershipsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const KeycloakMembershipBulkRemoveAction = ({ rows, refetch }) => {
  const { mutate, isPending } = useBatchMutation<any, void>({
    rows,
    refetch,
    mutationFn: (row) =>
      offeringKeycloakMembershipsDestroy({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Resource permissions deleted'),
    renderPartialSuccessMessage: (count) =>
      translate('{count} resource permissions deleted', { count }),
    errorMessage: translate('Unable to delete resource permissions.'),
    renderErrorMessage: (count) =>
      translate('{count} resource permissions could not be deleted', { count }),
    confirmation: {
      title: translate('Removing all selected resource permissions'),
      body: translate(
        "You are about to revoke resource access from {count} users. Once removed, they'll immediately lose access and all associated permissions.",
        { count: rows.length },
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
      tooltip={translate('Remove all selected resource permissions')}
    />
  );
};
