import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  OfferingKeycloakMembership,
  offeringKeycloakMembershipsDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const DeleteKeycloakMembershipAction = ({
  row,
  refetch,
}: {
  row: OfferingKeycloakMembership;
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
    try {
      await offeringKeycloakMembershipsDestroy({ path: { uuid: row.uuid } });
      dispatch(showSuccess(translate('Resource access has been removed.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to remove resource access.'),
        ),
      );
    }
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
