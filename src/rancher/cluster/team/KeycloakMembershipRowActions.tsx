import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  KeycloakUserGroupMembership,
  keycloakUserGroupMembershipsDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

const DeleteKeycloakMembershipAction = ({
  row,
  refetch,
}: {
  row: KeycloakUserGroupMembership;
  refetch;
}) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to revoke resource access from {name} user?',
          {
            name: (
              <strong>
                {[row.first_name, row.last_name].filter(Boolean).join(' ') ||
                  row.username}
              </strong>
            ),
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await keycloakUserGroupMembershipsDestroy({ path: { uuid: row.uuid } });
    refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};

export const KeycloakMembershipRowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[DeleteKeycloakMembershipAction]}
  />
);
