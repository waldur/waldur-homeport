import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { getCustomer as getCustomerSelector } from '@waldur/workspace/selectors';

import { OrganizationExpandableRow } from './OrganizationExpandableRow';
import { OrganizationHoverableRow } from './OrganizationHoverableRow';
import { RoleField } from './RoleField';

const exportRow = (row) => [
  row.name,
  row.email || DASH_ESCAPE_CODE,
  row.organization_group_name || DASH_ESCAPE_CODE,
  row.projects_count || 0,
  formatDateTime(row.created),
];

const exportFields = [
  'Name',
  'Email',
  'Organization group',
  'Projects',
  'Created',
];

export const BaseOrganizationsList: FunctionComponent<{ user }> = ({
  user,
}) => {
  const filter = useMemo(
    () => ({
      field: [
        'uuid',
        'name',
        'abbreviation',
        'role',
        'email',
        'organization_group_name',
        'projects_count',
        'created',
        'created_by_full_name',
        'created_by_username',
      ],
      user_uuid: user.uuid,
    }),
    [user],
  );

  const props = useTable({
    table: 'customerList',
    fetchData: createFetcher('customers'),
    queryField: 'name',
    filter,
    exportRow,
    exportFields,
  });

  const currentOrganization = useSelector(getCustomerSelector);

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
      {...props}
      columns={columns}
      verboseName={translate('organizations')}
      title={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      rowClass={({ row }) =>
        currentOrganization?.uuid === row.uuid ? 'bg-gray-200' : ''
      }
      hoverableRow={OrganizationHoverableRow}
      expandableRow={OrganizationExpandableRow}
      fullWidth={true}
    />
  );
};
