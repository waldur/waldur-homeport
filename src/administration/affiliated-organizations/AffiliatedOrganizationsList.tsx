import { FunctionComponent } from 'react';
import {
  AffiliatedOrganization,
  affiliatedOrganizationsList,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { AffiliatedOrganizationCreateButton } from './AffiliatedOrganizationCreateButton';
import { AffiliatedOrganizationRowActions } from './AffiliatedOrganizationRowActions';

export const AffiliatedOrganizationsList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'AffiliatedOrganizationsList',
    fetchData: createFetcher(affiliatedOrganizationsList),
    queryField: 'query',
  });

  return (
    <Table<AffiliatedOrganization>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
          copyField: (row) => row.name,
        },
        {
          title: translate('Code'),
          render: ({ row }) => <>{row.code}</>,
          copyField: (row) => row.code,
        },
        {
          title: translate('Abbreviation'),
          render: ({ row }) => renderFieldOrDash(row.abbreviation),
        },
        {
          title: translate('Country'),
          render: ({ row }) => renderFieldOrDash(row.country),
        },
        {
          title: translate('Email'),
          render: ({ row }) => renderFieldOrDash(row.email),
        },
        {
          title: translate('Projects'),
          render: ({ row }) =>
            row.projects_count != null ? row.projects_count : DASH_ESCAPE_CODE,
          orderField: 'projects_count',
        },
        {
          title: translate('Created'),
          render: ({ row }) => renderFieldOrDash(formatDateTime(row.created)),
          orderField: 'created',
        },
      ]}
      verboseName={translate('Affiliated organizations')}
      rowActions={AffiliatedOrganizationRowActions}
      tableActions={
        <AffiliatedOrganizationCreateButton refetch={tableProps.fetch} />
      }
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
    />
  );
};
