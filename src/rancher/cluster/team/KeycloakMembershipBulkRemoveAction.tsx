import { TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { keycloakUserGroupMembershipsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const KeycloakMembershipBulkRemoveAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Removing all selected resource permissions'),
          translate(
            "You are about to revoke resource access from {count} users. Once removed, they'll immediately lose access and all associated permissions.",
            { count: rows.length },
          ),
          { forDeletion: true },
        );
      } catch {
        return;
      }
      try {
        const promises = rows.map((row) =>
          keycloakUserGroupMembershipsDestroy({
            path: { uuid: row.uuid },
          }),
        );
        await Promise.all(promises);
        dispatch(showSuccess(translate('Resource permissions deleted')));
        refetch();
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to delete resource permissions.'),
          ),
        );
      }
    },
  });

  return (
    <ActionItem
      title={translate('Remove')}
      action={mutate}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      tooltip={translate('Remove all selected resource permissions')}
      disabled={isPending}
    />
  );
};
