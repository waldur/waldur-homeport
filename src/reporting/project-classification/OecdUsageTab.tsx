import { EChartsOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import {
  ProjectsLimitsGroupedByOecd,
  ProjectsUsagesGroupedByOecd,
} from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { ClassificationUsageRow } from './types';

interface OecdUsageTabProps {
  usages: ProjectsUsagesGroupedByOecd | null;
  limits: ProjectsLimitsGroupedByOecd | null;
  projectCounts: Array<{ oecd_code: string; count: number }>;
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
      const limit = limitData[category]?.[componentType] || '-';
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

export const OecdUsageTab: FC<OecdUsageTabProps> = ({
  usages,
  limits,
  projectCounts,
}) => {
  const tableData = useMemo(
    () => flattenUsageData(usages, limits),
    [usages, limits],
  );

  // Aggregate project counts by OECD code
  const aggregatedCounts = useMemo(() => {
    const countMap = new Map<string, number>();
    projectCounts.forEach((item) => {
      const current = countMap.get(item.oecd_code) || 0;
      countMap.set(item.oecd_code, current + item.count);
    });
    return Array.from(countMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
  }, [projectCounts]);

  const chartOptions = useMemo<EChartsOption>(() => {
    const top10 = aggregatedCounts.slice(0, 10);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: top10.map((item) => item.code),
        inverse: true,
        axisLabel: {
          width: 200,
          overflow: 'truncate',
        },
      },
      series: [
        {
          type: 'bar',
          data: top10.map((item) => item.count),
          itemStyle: {
            color: '#50cd89',
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => params.value.toLocaleString(),
          },
        },
      ],
    };
  }, [aggregatedCounts]);

  const noop = () => {};

  return (
    <>
      <Row className="g-6 mb-6">
        <Col xs={12}>
          <Card>
            <Card.Header>
              <Card.Title>
                {translate('Projects by OECD classification')}
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {aggregatedCounts.length > 0 ? (
                <EChart options={chartOptions} height="400px" />
              ) : (
                <div className="text-center text-muted py-10">
                  {translate('No project count data available')}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
    </>
  );
};
