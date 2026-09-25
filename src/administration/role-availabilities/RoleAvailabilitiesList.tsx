import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  roleAvailabilitiesDestroy,
  roleAvailabilitiesList,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const DeleteAvailabilityAction = ({ row, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => roleAvailabilitiesDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Role availability has been removed.'),
    errorMessage: translate('Unable to delete role availability.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Delete availability of role "{role}" for {scope_type} "{scope}"? Active user role grants tied to this availability will be revoked asynchronously.',
        {
          role: row.role_name,
          scope_type: row.scope_type,
          scope: row.scope_name || row.scope_uuid || '?',
        },
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      disabled={deleteMutation.isPending}
    />
  );
};

export const RoleAvailabilitiesList: FC<TableWithPortal> = ({ portal }) => {
  const tableProps = useTable({
    table: 'RoleAvailabilitiesList',
    fetchData: createFetcher(roleAvailabilitiesList),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Role availabilities')}
      verboseName={translate('role availabilities')}
      // Rendered only as a tab of the roles page, whose card and toolbar these
      // controls belong to.
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      columns={[
        {
          title: translate('Role'),
          render: ({ row }) => row.role_name,
          copyField: (row) => row.role_name,
        },
        {
          title: translate('Role scope'),
          render: ({ row }) => renderFieldOrDash(row.role_content_type),
        },
        {
          title: translate('Bound to'),
          render: ({ row }) => (
            <>
              <span>{row.scope_name || row.scope_uuid}</span>
              <Badge
                variant="neutral"
                shape="pill"
                tone="outline"
                className="ms-2"
              >
                {row.scope_type}
              </Badge>
            </>
          ),
        },
        {
          title: translate('Source'),
          render: ({ row }) =>
            row.is_profile_managed ? (
              <Badge variant="info" shape="pill" tone="outline">
                {translate('Profile: {name}', { name: row.profile_name })}
              </Badge>
            ) : (
              <Badge variant="neutral" shape="pill" tone="outline">
                {translate('Direct')}
              </Badge>
            ),
        },
      ]}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <DeleteAvailabilityAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
      showPageSizeSelector={true}
    />
  );
};
