import { FunctionComponent, useMemo } from 'react';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { OrganizationExpandableRow } from '@waldur/user/affiliations/OrganizationExpandableRow';
import { RoleField } from '@waldur/user/affiliations/RoleField';

export const OrganizationGroupOrganizationsList: FunctionComponent<any> = (
  props,
) => {
  const filter = useMemo(
    () => ({
      organization_group_uuid: props.organizationGroup.uuid,
    }),
    [props.organization_group_uuid],
  );
  const tableProps = useTable({
    table: 'customerList',
    fetchData: createFetcher('customers'),
    queryField: 'name',
    filter,
    exportRow: (row) => [
      row.name,
      row.email || DASH_ESCAPE_CODE,
      row.organization_group_name || DASH_ESCAPE_CODE,
      row.projects_count || 0,
      formatDateTime(row.created),
    ],
    exportFields: [
      'Name',
      'Email',
      'Organization group',
      'Projects',
      'Created',
    ],
  });
  const columns = [
    {
      title: translate('Organization'),
      render: ({ row }) => (
        <Link
          state="organization.dashboard"
          params={{ uuid: row.uuid }}
          label={row.name}
        />
      ),
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <>{row.abbreviation || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Role'),
      render: RoleField,
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.email || DASH_ESCAPE_CODE}</>,
    },
    {
      title: translate('Organization group'),
      render: ({ row }) => (
        <>{row.organization_group_name || DASH_ESCAPE_CODE}</>
      ),
    },
    {
      title: translate('Projects'),
      render: ({ row }) => <>{row.projects_count || 0}</>,
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{renderFieldOrDash(formatDate(row.created))}</>,
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
      fullWidth={true}
    />
  );
};
