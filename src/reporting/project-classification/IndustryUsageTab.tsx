import { EChartsOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import {
  ProjectsLimitsGroupedByIndustryFlag,
  ProjectsUsagesGroupedByIndustryFlag,
} from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { ClassificationUsageRow } from './types';

interface IndustryUsageTabProps {
  usages: ProjectsUsagesGroupedByIndustryFlag | null;
  limits: ProjectsLimitsGroupedByIndustryFlag | null;
  projectCounts: Array<{ industry_flag: boolean; count: number }>;
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
    render: ({ row }) => (
      <span className="fw-bold text-primary">{row.usage}</span>
    ),
  },
  {
    title: translate('Limit'),
    render: ({ row }) => <span className="text-muted">{row.limit}</span>,
  },
];

export const IndustryUsageTab: FC<IndustryUsageTabProps> = ({
  usages,
  limits,
  projectCounts,
}) => {
  const tableData = useMemo(
    () => flattenUsageData(usages, limits),
    [usages, limits],
  );

  // Aggregate project counts
  const aggregatedCounts = useMemo(() => {
    let industryCount = 0;
    let academicCount = 0;
    projectCounts.forEach((item) => {
      if (item.industry_flag) {
        industryCount += item.count;
      } else {
        academicCount += item.count;
      }
    });
    return [
      { label: translate('Academic'), count: academicCount, color: '#50cd89' },
      { label: translate('Industry'), count: industryCount, color: '#7239ea' },
    ];
  }, [projectCounts]);

  const chartOptions = useMemo<EChartsOption>(() => {
    const total = aggregatedCounts.reduce((sum, item) => sum + item.count, 0);
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percent =
            total > 0 ? ((params.value / total) * 100).toFixed(1) : 0;
          return `${params.name}: ${params.value.toLocaleString()} (${percent}%)`;
        },
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'center',
            formatter: () =>
              `{total|${total.toLocaleString()}}\n{label|${translate('Total')}}`,
            rich: {
              total: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#181C32',
                lineHeight: 32,
              },
              label: {
                fontSize: 12,
                color: '#A1A5B7',
                lineHeight: 20,
              },
            },
          },
          emphasis: {
            label: { show: true },
          },
          labelLine: { show: false },
          data: aggregatedCounts.map((item) => ({
            name: item.label,
            value: item.count,
            itemStyle: { color: item.color },
          })),
        },
      ],
    };
  }, [aggregatedCounts]);

  const noop = () => {};

  return (
    <Row className="g-6 mb-6">
      <Col xs={6}>
        <Card>
          <Card.Header>
            <Card.Title>
              {translate('Projects by industry classification')}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            {aggregatedCounts.some((item) => item.count > 0) ? (
              <EChart options={chartOptions} height="300px" />
            ) : (
              <NoResult
                title={translate('No data available')}
                message={translate('Try adjusting your filters or date range.')}
              />
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col xs={6}>
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
          title={translate('Usage by industry classification')}
          verboseName={translate('classifications')}
        />
      </Col>
    </Row>
  );
};
