import { TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { offeringKeycloakMembershipsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
          offeringKeycloakMembershipsDestroy({
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
