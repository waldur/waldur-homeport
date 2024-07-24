import { FunctionComponent, useMemo } from 'react';

import { ENV } from '@waldur/configs/default';
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
      export: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <>{row.abbreviation || DASH_ESCAPE_CODE}</>,
      export: 'abbreviation',
    },
    {
      title: translate('Role'),
      render: RoleField,
      export: (row) => {
        const role = ENV.roles.find((role) => role.name === row.role_name);
        return role?.description || role?.name || DASH_ESCAPE_CODE;
      },
      exportKeys: ['role_name'],
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.email || DASH_ESCAPE_CODE}</>,
      export: 'email',
    },
    {
      title: translate('Organization group'),
      render: ({ row }) => (
        <>{row.organization_group_name || DASH_ESCAPE_CODE}</>
      ),
      export: 'organization_group_name',
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
