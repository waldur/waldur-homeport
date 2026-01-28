import { FC, useCallback, useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { renderFieldOrDash } from '@waldur/table/utils';

import { AffiliationAggregation } from './types';

interface Props {
  data: AffiliationAggregation[];
  componentTypes: string[];
}

export const AffiliationUsageTable: FC<Props> = ({ data, componentTypes }) => {
  const noop = useCallback(() => {}, []);

  const columns = useMemo<Column<AffiliationAggregation>[]>(() => {
    const cols: Column<AffiliationAggregation>[] = [
      {
        title: translate('Affiliation'),
        render: ({ row }) => <span className="fw-bold">{row.affiliation}</span>,
        orderField: 'affiliation',
        export: (row) => row.affiliation,
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
      {
        title: translate('Total cost'),
        render: ({ row }) => (
          <span className="fw-semibold">{defaultCurrency(row.total_cost)}</span>
        ),
        orderField: 'total_cost',
        export: (row) => row.total_cost,
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
    <Table<AffiliationAggregation>
      title={translate('Usage by affiliation')}
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
      verboseName={translate('affiliations')}
      standalone
      initialSorting={{ field: 'total_resources', mode: 'desc' }}
      enableExport
    />
  );
};
