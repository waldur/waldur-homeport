import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  ProjectsLimitsGroupedByIndustryFlag,
  ProjectsUsagesGroupedByIndustryFlag,
} from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { SimpleTable } from '@waldur/table/SimpleTable';
import { Column } from '@waldur/table/types';
import { getSimpleExportData } from '@waldur/table/utils';

import { ClassificationUsageRow } from './types';

interface IndustryUsageTableProps {
  usages: ProjectsUsagesGroupedByIndustryFlag | null;
  limits: ProjectsLimitsGroupedByIndustryFlag | null;
}

function flattenUsageData(
  usages: ProjectsUsagesGroupedByIndustryFlag | null,
  limits: ProjectsLimitsGroupedByIndustryFlag | null,
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
    title: translate('Industry Category'),
    render: ({ row }) => (
      <span className="fw-semibold">
        {row.category === 'true'
          ? translate('Industry')
          : translate('Academic')}
      </span>
    ),
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

export const IndustryUsageTable: FC<IndustryUsageTableProps> = ({
  usages,
  limits,
}) => {
  const tableData = useMemo(
    () => flattenUsageData(usages, limits),
    [usages, limits],
  );

  return (
    <Row>
      <Col>
        <ChartCard
          title={translate('Usage by industry classification')}
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
      </Col>
    </Row>
  );
};
