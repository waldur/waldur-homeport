import { FC, useMemo } from 'react';
import { SramGroup, sramGroupsList } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { OrganizationLink } from '@/customer/list/OrganizationLink';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  SramGroupsFilter,
  SramGroupsFilterFormId,
  selectSramGroupsFilter,
} from '@/table/generated/SramGroupsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { RoleField } from '@/user/affiliations/RoleField';

import { SramGroupKindBadge } from './SramGroupKindBadge';
import { toStringList } from './utils';

const LabelsCell: FC<{ labels: unknown }> = ({ labels }) => {
  const items = toStringList(labels);
  if (!items.length) return <>{renderFieldOrDash(null)}</>;
  return (
    <span className="d-inline-flex flex-wrap gap-1">
      {items.map((label) => (
        <Badge key={label} variant="neutral" size="sm" tone="outline">
          {label}
        </Badge>
      ))}
    </span>
  );
};

/** Read-only list of the SRAM collaborations and groups mapped into Waldur. */
export const SramGroupsList: FC = () => {
  const values = useFilterValues(SramGroupsFilterFormId);
  const filter = useMemo(() => selectSramGroupsFilter(values), [values]);

  const tableProps = useTable({
    table: SramGroupsFilterFormId,
    fetchData: createFetcher(sramGroupsList),
    filter,
    queryField: 'display_name',
    syncFiltersToURL: true,
  });

  const columns: Column<SramGroup>[] = [
    {
      title: translate('Display name'),
      render: ({ row }) => <>{row.display_name}</>,
      id: 'display_name',
      copyField: (row) => row.display_name,
      export: 'display_name',
    },
    {
      title: translate('URN'),
      render: ({ row }) => <code>{row.urn}</code>,
      id: 'urn',
      copyField: (row) => row.urn,
      export: 'urn',
    },
    {
      title: translate('Kind'),
      render: ({ row }) => <SramGroupKindBadge kind={row.kind} />,
      id: 'kind',
      export: 'kind',
    },
    {
      title: translate('Organization'),
      render: ({ row }) =>
        row.customer_uuid ? (
          <OrganizationLink uuid={row.customer_uuid}>
            {row.customer_name}
          </OrganizationLink>
        ) : (
          renderFieldOrDash(row.customer_name)
        ),
      id: 'customer_name',
      export: 'customer_name',
    },
    {
      title: translate('Placeholder role'),
      render: ({ row }) =>
        row.role_name ? (
          <div>
            <RoleField row={{ role_name: row.role_name }} />
            <div>
              <small className="text-muted">{row.role_name}</small>
            </div>
          </div>
        ) : (
          renderFieldOrDash(null)
        ),
      id: 'role_name',
      export: 'role_name',
    },
    {
      title: translate('Members'),
      render: ({ row }) => <>{row.member_count}</>,
      id: 'member_count',
      export: 'member_count',
    },
    {
      title: translate('Labels'),
      render: ({ row }) => <LabelsCell labels={row.labels} />,
      id: 'labels',
      export: (row) => toStringList(row.labels).join(', '),
    },
    {
      title: translate('Description'),
      render: ({ row }) => renderFieldOrDash(row.description),
      id: 'description',
      optional: true,
      export: 'description',
    },
  ];

  return (
    <Table<SramGroup>
      {...tableProps}
      columns={columns}
      title={translate('SRAM groups')}
      verboseName={translate('SRAM groups')}
      emptyMessage={translate(
        'No SRAM collaborations have been provisioned yet. They appear here after SRAM pushes them over SCIM.',
      )}
      filters={<SramGroupsFilter />}
      hasQuery
      hasOptionalColumns
      showPageSizeSelector
      enableExport
    />
  );
};
