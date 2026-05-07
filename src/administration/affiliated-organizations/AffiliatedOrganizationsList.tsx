import { FunctionComponent } from 'react';
import {
  AffiliatedOrganization,
  affiliatedOrganizationsList,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AffiliatedOrganizationCreateButton } from './AffiliatedOrganizationCreateButton';
import { AffiliatedOrganizationProjects } from './AffiliatedOrganizationProjects';
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
      verboseName={translate('Affiliations')}
      expandableRow={AffiliatedOrganizationProjects}
      rowActions={AffiliatedOrganizationRowActions}
      tableActions={
        <AffiliatedOrganizationCreateButton refetch={tableProps.fetch} />
      }
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
    />
  );
};
