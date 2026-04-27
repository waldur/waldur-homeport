import { FunctionComponent, useMemo } from 'react';
import { Customer, customersList, CustomersListData } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OrganizationExpandableRow } from './OrganizationExpandableRow';

export const OrganizationGroupOrganizationsList: FunctionComponent<any> = (
  props,
) => {
  const filter = useMemo(
    (): CustomersListData['query'] => ({
      organization_group_uuid: props.organizationGroup.uuid,
    }),
    [props.organization_group_uuid],
  );
  const tableProps = useTable({
    table: 'customerList',
    fetchData: createFetcher(customersList),
    queryField: 'name',
    filter,
  });
  const columns: Column<Customer>[] = [
    {
      title: translate('Organization'),
      render: ({ row }) => (
        <Link
          state="organization.dashboard"
          params={{ uuid: row.uuid }}
          label={row.name}
        />
      ),

      export: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <>{row.abbreviation || DASH_ESCAPE_CODE}</>,
      export: 'abbreviation',
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.email || DASH_ESCAPE_CODE}</>,
      export: 'email',
    },
    {
      title: translate('Projects'),
      render: ({ row }) => <>{row.projects_count || 0}</>,
      export: (row) => row.projects_count || 0,
      exportKeys: ['projects_count'],
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{renderFieldOrDash(formatDate(row.created))}</>,
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('organizations')}
      title={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      rowClass={({ row }) =>
        props.currentOrganization?.uuid === row.uuid ? 'bg-gray-200' : ''
      }
      expandableRow={OrganizationExpandableRow}
    />
  );
};
