import { FunctionComponent, useMemo } from 'react';
import { staffPasskeysList } from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { Badge } from '@/core/Badge';
import { formatDate, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { StaffPasskeyRevokeButton } from './StaffPasskeyRevokeButton';

const StaffPasskeyActions = ({ row, fetch }) =>
  row.is_active ? <StaffPasskeyRevokeButton row={row} refetch={fetch} /> : null;

/**
 * A staff view of one user's passkeys, for recovery.
 *
 * There are deliberately no backup codes, so revoking a lost credential here
 * — and the user then enrolling a new one — is the recovery path.
 */
export const StaffPasskeysList: FunctionComponent<{ user? }> = ({ user }) => {
  const filter = useMemo(() => ({ user_uuid: user?.uuid }), [user?.uuid]);
  const props = useTable({
    table: `staff-passkeys-${user?.uuid}`,
    fetchData: createFetcher(staffPasskeysList),
    filter,
  });

  const columns: Column<any>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      export: 'name',
    },
    {
      title: translate('Status'),
      render: ({ row }) =>
        row.is_active ? (
          <Badge variant="success" light>
            {translate('Active')}
          </Badge>
        ) : (
          <Badge variant="danger" light>
            {translate('Revoked')}
          </Badge>
        ),
    },
    {
      title: translate('Added'),
      render: ({ row }) => formatDate(row.created),
      export: 'created',
    },
    {
      title: translate('Last used'),
      render: ({ row }) =>
        row.last_used_at
          ? formatRelative(row.last_used_at)
          : renderFieldOrDash(null),
    },
    {
      title: translate('Revocation reason'),
      render: ({ row }) => renderFieldOrDash(row.revocation_reason || null),
    },
  ];

  const activeCount = (props.rows ?? []).filter((row) => row.is_active).length;

  return (
    <>
      {activeCount === 1 && (
        <AlertItem
          variant="warning"
          title={translate('This is their only passkey')}
          body={translate(
            'Revoking it leaves the user with none. If passkeys are required for their account they will be held at the enrolment page until they add another, so make sure they can reach a device first.',
          )}
          className="mb-4"
        />
      )}
      <Table
        {...props}
        columns={columns}
        verboseName={translate('passkeys')}
        rowActions={StaffPasskeyActions}
        hasQuery={false}
      />
    </>
  );
};
