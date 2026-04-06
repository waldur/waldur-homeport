import { FunctionComponent, useMemo } from 'react';
import {
  personalAccessTokensList,
  PersonalAccessToken,
} from 'waldur-js-client';

import { formatDate, formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { personalAccessTokensTable } from './constants';
import { PersonalAccessTokenActions } from './PersonalAccessTokenActions';
import { PersonalAccessTokenCreateButton } from './PersonalAccessTokenCreateButton';
import { PersonalAccessTokenExpandableRow } from './PersonalAccessTokenExpandableRow';

const TokenStatus: FunctionComponent<{ row: PersonalAccessToken }> = ({
  row,
}) => {
  if (!row.is_active) {
    return (
      <span className="badge badge-light-danger">{translate('Revoked')}</span>
    );
  }
  if (new Date(row.expires_at) < new Date()) {
    return (
      <span className="badge badge-light-warning">{translate('Expired')}</span>
    );
  }
  return (
    <span className="badge badge-light-success">{translate('Active')}</span>
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
