import { FunctionComponent, useMemo } from 'react';
import { passkeysList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { passkeysTable } from './constants';
import { PasskeyActions } from './PasskeyActions';
import { PasskeyRegisterButton } from './PasskeyRegisterButton';

const PasskeyStatus: FunctionComponent<{ row }> = ({ row }) => {
  if (!row.is_active) {
    return (
      <Badge variant="danger" light>
        {translate('Revoked')}
      </Badge>
    );
  }
  // A credential registered under a different RP ID is still in the database
  // but the browser will never offer it again. Saying so is the difference
  // between a user re-enrolling and a user filing a bug about a key that
  // "stopped working".
  if (row.is_orphaned) {
    return (
      <Badge variant="warning" light>
        {translate('Unusable')}
      </Badge>
    );
  }
  return (
    <Badge variant="success" light>
      {translate('Active')}
    </Badge>
  );
};

const describeType = (row): string => {
  if (row.is_backed_up) return translate('Synced passkey');
  if (row.attachment === 'platform') return translate('This device');
  if (row.attachment === 'cross-platform') return translate('Security key');
  return translate('Passkey');
};

export const PasskeysList: FunctionComponent = () => {
  const filter = useMemo(() => ({}), []);
  const props = useTable({
    table: passkeysTable,
    fetchData: createFetcher(passkeysList),
    filter,
  });

  const columns: Column<any>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      export: 'name',
    },
    {
      title: translate('Type'),
      render: ({ row }) => describeType(row),
    },
    {
      title: translate('Status'),
      render: ({ row }) => <PasskeyStatus row={row} />,
    },
    {
      title: translate('Sign-in'),
      render: ({ row }) =>
        row.is_discoverable
          ? translate('Passwordless')
          : translate('Second factor only'),
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
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('passkeys')}
      tableActions={<PasskeyRegisterButton refetch={props.fetch} />}
      rowActions={PasskeyActions}
      showPageSizeSelector={true}
    />
  );
};
