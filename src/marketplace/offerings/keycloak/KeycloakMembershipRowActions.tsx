import {
  OfferingKeycloakMembership,
  offeringKeycloakMembershipsDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const DeleteKeycloakMembershipAction = ({
  row,
  refetch,
}: {
  row: OfferingKeycloakMembership;
  refetch;
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      offeringKeycloakMembershipsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Resource access has been removed.'),
    errorMessage: translate('Unable to remove resource access.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
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
      options: { forDeletion: true },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
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
