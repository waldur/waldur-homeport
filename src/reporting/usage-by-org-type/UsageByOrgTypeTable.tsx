import { FC, useCallback, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { renderFieldOrDash } from '@waldur/table/utils';

import { OrgTypeAggregation } from './types';

interface Props {
  data: OrgTypeAggregation[];
  componentTypes: string[];
}

export const UsageByOrgTypeTable: FC<Props> = ({ data, componentTypes }) => {
  const noop = useCallback(() => {}, []);

  const columns = useMemo<Column<OrgTypeAggregation>[]>(() => {
    const cols: Column<OrgTypeAggregation>[] = [
      {
        title: translate('Organization type'),
        render: ({ row }) => (
          <span className="fw-bold">
            {row.organization_type || translate('Unknown')}
          </span>
        ),
        orderField: 'organization_type',
        export: (row) => row.organization_type || 'Unknown',
      },
      {
        title: translate('Total resources'),
        render: ({ row }) => (
          <span className="fw-semibold">
            {row.total_resources.toLocaleString()}
          </span>
        ),
        orderField: 'total_resources',
        export: (row) => row.total_resources,
      },
      {
        title: translate('Total usage'),
        render: ({ row }) => (
          <span className="fw-semibold">
            {row.total_usage.toLocaleString()}
          </span>
        ),
        orderField: 'total_usage',
        export: (row) => row.total_usage,
      },
    ];

    // Add dynamic columns for each component type
    componentTypes.forEach((type) => {
      cols.push({
        title: type,
        render: ({ row }) =>
          renderFieldOrDash(
            row.components[type] ? row.components[type].toLocaleString() : null,
          ),
        export: (row) => row.components[type] || 0,
      });
    });

    return cols;
  }, [componentTypes]);

  return (
    <Table<OrgTypeAggregation>
      title={translate('Usage by organization type')}
      columns={columns}
      rows={data}
      fetch={noop}
      loading={false}
      error={null}
      activeColumns={{}}
      columnPositions={[]}
      resetSelection={noop}
      setFilterPosition={noop}
      initColumnPositions={noop}
      resetPagination={noop}
      hasPagination={false}
      hasQuery
      verboseName={translate('organization types')}
      standalone
      initialSorting={{ field: 'total_resources', mode: 'desc' }}
      enableExport
    />
  );
};
