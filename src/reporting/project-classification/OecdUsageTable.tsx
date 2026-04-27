import { FC, useMemo } from 'react';
import {
  ProjectsLimitsGroupedByOecd,
  ProjectsUsagesGroupedByOecd,
} from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { getSimpleExportData } from '@/table/utils';

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
    render: ({ row }) => <span className="fw-bold">{row.usage}</span>,
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

  return (
    <ChartCard
      title={translate('Usage by OECD classification')}
      getExportData={() => getSimpleExportData(tableColumns, tableData)}
      showPNG={false}
      isEmpty={!tableData || tableData.length === 0}
    >
      {() => (
        <SimpleTable<ClassificationUsageRow>
          columns={tableColumns}
          rows={tableData}
        />
      )}
    </ChartCard>
  );
};
