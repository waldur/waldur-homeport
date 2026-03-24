import { FC, useMemo } from 'react';
import {
  ProjectsLimitsGroupedByOecd,
  ProjectsUsagesGroupedByOecd,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { ClassificationUsageRow } from './types';

interface OecdUsageTableProps {
  usages: ProjectsUsagesGroupedByOecd | null;
  limits: ProjectsLimitsGroupedByOecd | null;
}

function flattenUsageData(
  usages: ProjectsUsagesGroupedByOecd | null,
  limits: ProjectsLimitsGroupedByOecd | null,
): ClassificationUsageRow[] {
  if (!usages?.usages) return [];

  const rows: ClassificationUsageRow[] = [];
  const usageData = usages.usages;
  const limitData = limits?.limits || {};

  for (const [category, components] of Object.entries(usageData)) {
    for (const [componentType, usage] of Object.entries(components)) {
      const limit = limitData[category]?.[componentType] || DASH_ESCAPE_CODE;
      rows.push({
        category,
        componentType,
        usage: usage as string,
        limit: limit as string,
      });
    }
  }

  return rows;
}

const tableColumns: Column<ClassificationUsageRow>[] = [
  {
    title: translate('OECD Category'),
    render: ({ row }) => <span className="fw-semibold">{row.category}</span>,
  },
  {
    title: translate('Component'),
    render: ({ row }) => row.componentType,
  },
  {
    title: translate('Usage'),
    render: ({ row }) => (
      <span className="fw-bold text-primary">{row.usage}</span>
    ),
  },
  {
    title: translate('Limit'),
    render: ({ row }) => <span className="text-muted">{row.limit}</span>,
  },
];

export const OecdUsageTable: FC<OecdUsageTableProps> = ({ usages, limits }) => {
  const tableData = useMemo(
    () => flattenUsageData(usages, limits),
    [usages, limits],
  );

  const noop = () => {};

  return (
    <Table<ClassificationUsageRow>
      columns={tableColumns}
      rows={tableData}
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
      title={translate('Usage by OECD classification')}
      verboseName={translate('classifications')}
    />
  );
};
