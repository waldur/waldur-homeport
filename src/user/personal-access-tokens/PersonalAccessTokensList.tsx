import { FunctionComponent, useMemo } from 'react';
import {
  personalAccessTokensList,
  PersonalAccessToken,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { personalAccessTokensTable } from './constants';
import { PersonalAccessTokenActions } from './PersonalAccessTokenActions';
import { PersonalAccessTokenCreateButton } from './PersonalAccessTokenCreateButton';
import { PersonalAccessTokenExpandableRow } from './PersonalAccessTokenExpandableRow';

const TokenStatus: FunctionComponent<{ row: PersonalAccessToken }> = ({
  row,
}) => {
  if (!row.is_active) {
    return (
      <Badge variant="danger" light>
        {translate('Revoked')}
      </Badge>
    );
  }
  if (new Date(row.expires_at) < new Date()) {
    return (
      <Badge variant="warning" light>
        {translate('Expired')}
      </Badge>
    );
  }
  return (
    <Badge variant="success" light>
      {translate('Active')}
    </Badge>
  );
};

export const PersonalAccessTokensList: FunctionComponent = () => {
  const filter = useMemo(() => ({}), []);
  const props = useTable({
    table: personalAccessTokensTable,
    fetchData: createFetcher(personalAccessTokensList),
    queryField: 'name',
    filter,
  });

  const columns: Column<PersonalAccessToken>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      export: 'name',
    },
    {
      title: translate('Token prefix'),
      render: ({ row }) => (
        <code>
          {row.token_prefix}
          ...
        </code>
      ),
    },
    {
      title: translate('Status'),
      render: ({ row }) => <TokenStatus row={row} />,
    },
    {
      title: translate('Scope'),
      render: ({ row }) => {
        const n = row.allowed_scopes?.length ?? 0;
        if (n === 0) return translate('Unrestricted');
        return n === 1
          ? translate('1 binding')
          : translate('{n} bindings', { n });
      },
    },
    {
      title: translate('Expires'),
      render: ({ row }) => formatDate(row.expires_at),
      export: 'expires_at',
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
      hasQuery={true}
      showPageSizeSelector={true}
      verboseName={translate('personal access tokens')}
      tableActions={<PersonalAccessTokenCreateButton refetch={props.fetch} />}
      rowActions={PersonalAccessTokenActions}
      expandableRow={PersonalAccessTokenExpandableRow}
    />
  );
};
