import { EChartsOption } from 'echarts';
import { FC, useCallback, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { renderFieldOrDash } from '@waldur/table/utils';

import {
  AffiliationCategory,
  getUniqueCategories,
  getUniqueCountries,
  getUniqueOrganizations,
  parseAffiliation,
  ParsedAffiliation,
} from '../affiliationParser';
import { UserAffiliationCount } from '../types';

import { ChartCard } from './ChartCard';
import { getChartExportData } from './utils';

interface AffiliationsChartProps {
  data: UserAffiliationCount[];
  refetch(): void;
}

interface AffiliationWithCount extends ParsedAffiliation {
  count: number;
}

type ViewMode = 'organization' | 'country' | 'category';

interface FilterOption {
  value: string;
  label: string;
}

/**
 * Parse and enrich affiliation data
 */
function parseAffiliations(
  data: UserAffiliationCount[],
): AffiliationWithCount[] {
  return data.map((item) => ({
    ...parseAffiliation(item.affiliation),
    count: item.count,
  }));
}

/**
 * Aggregate data by a specific field
 */
function aggregateBy(
  data: AffiliationWithCount[],
  field: ViewMode,
): Array<{ name: string; value: number }> {
  const aggregated = new Map<string, number>();

  data.forEach((item) => {
    let key: string;
    switch (field) {
      case 'organization':
        key = item.organization || translate('Unknown');
        break;
      case 'country':
        key = item.countryLabel || translate('Unknown');
        break;
      case 'category':
        key = item.categoryLabel || translate('Unknown');
        break;
    }
    aggregated.set(key, (aggregated.get(key) || 0) + item.count);
  });

  return Array.from(aggregated.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Prepare chart data (top 10 + Other)
 */
function prepareChartData(items: Array<{ name: string; value: number }>): {
  names: string[];
  values: number[];
  total: number;
} {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (items.length === 0) {
    return { names: [], values: [], total: 0 };
  }

  let displayItems: Array<{ name: string; value: number }>;

  if (items.length <= 10) {
    displayItems = items;
  } else {
    const top9 = items.slice(0, 9);
    const rest = items.slice(9);
    const otherCount = rest.reduce((sum, item) => sum + item.value, 0);

    displayItems = [...top9, { name: translate('Other'), value: otherCount }];
  }

  // Reverse for horizontal bar (first item at top)
  const reversed = [...displayItems].reverse();

  return {
    names: reversed.map((item) => item.name),
    values: reversed.map((item) => item.value),
    total,
  };
}

const tableColumns: Column<AffiliationWithCount>[] = [
  {
    title: translate('Organization'),
    render: ({ row }) => (
      <span className="fw-semibold">{renderFieldOrDash(row.organization)}</span>
    ),
  },
  {
    title: translate('Country'),
    render: ({ row }) => <span>{row.countryLabel}</span>,
  },
  {
    title: translate('Category'),
    render: ({ row }) => (
      <span className="text-muted">{row.categoryLabel}</span>
    ),
  },
  {
    title: translate('Identifier'),
    render: ({ row }) => (
      <span className="text-muted font-monospace">
        {renderFieldOrDash(row.identifier)}
      </span>
    ),
  },
  {
    title: translate('Users'),
    render: ({ row }) => (
      <span className="fw-bold text-primary">{row.count}</span>
    ),
  },
];

export const AffiliationsChart: FC<AffiliationsChartProps> = ({
  data,
  refetch,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('organization');
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] =
    useState<AffiliationCategory | null>(null);
  const [orgFilter, setOrgFilter] = useState<string | null>(null);

  // Parse all affiliations
  const parsedData = useMemo(() => parseAffiliations(data), [data]);

  // Get filter options
  const countryOptions = useMemo<FilterOption[]>(() => {
    const countries = getUniqueCountries(parsedData);
    return countries.map((c) => ({ value: c.code, label: c.label }));
  }, [parsedData]);

  const categoryOptions = useMemo<FilterOption[]>(() => {
    const categories = getUniqueCategories(parsedData);
    return categories.map((c) => ({ value: c.category, label: c.label }));
  }, [parsedData]);

  const orgOptions = useMemo<FilterOption[]>(() => {
    const orgs = getUniqueOrganizations(parsedData);
    return orgs.map((o) => ({ value: o, label: o }));
  }, [parsedData]);

  // Apply filters
  const filteredData = useMemo(() => {
    return parsedData.filter((item) => {
      if (countryFilter && item.country !== countryFilter) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (orgFilter && item.organization !== orgFilter) return false;
      return true;
    });
  }, [parsedData, countryFilter, categoryFilter, orgFilter]);

  // Aggregate for chart
  const aggregatedData = useMemo(
    () => aggregateBy(filteredData, viewMode),
    [filteredData, viewMode],
  );

  const { names, values, total } = useMemo(
    () => prepareChartData(aggregatedData),
    [aggregatedData],
  );

  const getExportData = useCallback(
    () =>
      getChartExportData(
        viewMode === 'organization'
          ? translate('Organization')
          : viewMode === 'country'
            ? translate('Country')
            : translate('Category'),
        names.map((name, i) => ({ name, value: values[i] })),
      ),
    [viewMode, names, values],
  );

  const chartOptions = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const param = params[0];
          const percent =
            total > 0 ? ((param.value / total) * 100).toFixed(1) : 0;
          return `${param.name}: ${param.value.toLocaleString()} (${percent}%)`;
        },
      },
      grid: {
        left: '3%',
        right: '15%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => value.toLocaleString(),
        },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          width: 180,
          overflow: 'truncate',
          ellipsis: '...',
        },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              const percent =
                total > 0 ? ((params.value / total) * 100).toFixed(1) : 0;
              return `${percent}%`;
            },
          },
        },
      ],
    }),
    [names, values, total],
  );

  const viewModeOptions = [
    { value: 'organization', label: translate('By organization') },
    { value: 'country', label: translate('By country') },
    { value: 'category', label: translate('By category') },
  ];

  if (data.length === 0) {
    return (
      <ChartCard
        title={translate('User affiliations')}
        getExportData={() => ({ fields: [], data: [] })}
        isEmpty
      >
        {() => (
          <NoResult
            title={translate('No data available')}
            message={translate('Try adjusting your filters or date range.')}
            callback={refetch}
            buttonTitle={translate('Refresh')}
          />
        )}
      </ChartCard>
    );
  }

  const chartHeight = useMemo(
    () => Math.min(400, Math.max(200, names.length * 35)),
    [names],
  );

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>{translate('Filters')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} sm={6} md={3}>
              <Select
                placeholder={translate('View mode')}
                value={viewModeOptions.find((o) => o.value === viewMode)}
                onChange={(option) =>
                  option && setViewMode(option.value as ViewMode)
                }
                options={viewModeOptions}
                isClearable={false}
                className="metronic-select-container"
                classNamePrefix="metronic-select"
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Select
                placeholder={translate('All countries')}
                value={countryOptions.find((o) => o.value === countryFilter)}
                onChange={(option) => setCountryFilter(option?.value || null)}
                options={countryOptions}
                isClearable
                className="metronic-select-container"
                classNamePrefix="metronic-select"
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Select
                placeholder={translate('All categories')}
                value={categoryOptions.find((o) => o.value === categoryFilter)}
                onChange={(option) =>
                  setCategoryFilter(
                    (option?.value as AffiliationCategory) || null,
                  )
                }
                options={categoryOptions}
                isClearable
                className="metronic-select-container"
                classNamePrefix="metronic-select"
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Select
                placeholder={translate('All organizations')}
                value={orgOptions.find((o) => o.value === orgFilter)}
                onChange={(option) => setOrgFilter(option?.value || null)}
                options={orgOptions}
                isClearable
                className="metronic-select-container"
                classNamePrefix="metronic-select"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary stats */}
      <Row className="g-4 mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-primary">{total}</div>
              <div className="text-muted fs-7">{translate('Total users')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-success">
                {orgOptions.length}
              </div>
              <div className="text-muted fs-7">
                {translate('Organizations')}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-info">
                {countryOptions.length}
              </div>
              <div className="text-muted fs-7">{translate('Countries')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-warning">
                {filteredData.length}
              </div>
              <div className="text-muted fs-7">
                {translate('Affiliations (filtered)')}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <ChartCard
        title={
          viewMode === 'organization'
            ? translate('Users by organization')
            : viewMode === 'country'
              ? translate('Users by country')
              : translate('Users by category')
        }
        getExportData={getExportData}
        isEmpty={aggregatedData.length === 0}
      >
        {(ref) => (
          <EChart
            ref={ref}
            options={chartOptions}
            height={`${chartHeight}px`}
          />
        )}
      </ChartCard>

      {/* Details table */}
      <Table<AffiliationWithCount>
        columns={tableColumns}
        rows={filteredData.sort((a, b) => b.count - a.count)}
        fetch={() => {}}
        loading={false}
        error={null}
        activeColumns={{}}
        columnPositions={[]}
        resetSelection={() => {}}
        setFilterPosition={() => {}}
        initColumnPositions={() => {}}
        resetPagination={() => {}}
        hasPagination={false}
        title={translate('Affiliation details')}
        verboseName={translate('affiliations')}
      />
    </>
  );
};
