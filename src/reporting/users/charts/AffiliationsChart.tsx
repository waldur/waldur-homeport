import { FC, useCallback, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { UserAffiliationCount } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { SummaryWidget } from '@/core/SummaryWidget';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { getSimpleExportData, renderFieldOrDash } from '@/table/utils';

import {
  AffiliationCategory,
  getUniqueCategories,
  getUniqueCountries,
  getUniqueOrganizations,
  parseAffiliation,
  ParsedAffiliation,
} from '../affiliationParser';

import { BarChart } from './BarChart';
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
    render: ({ row }) => <span className="fw-bold">{row.count}</span>,
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

  // Prepare chart data (top 9 + Other)
  const { chartData, total } = useMemo(() => {
    const totalCount = aggregatedData.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    if (aggregatedData.length <= 10) {
      return { chartData: aggregatedData, total: totalCount };
    }
    const top9 = aggregatedData.slice(0, 9);
    const rest = aggregatedData.slice(9);
    const otherCount = rest.reduce((sum, item) => sum + item.value, 0);
    return {
      chartData: [...top9, { name: translate('Other'), value: otherCount }],
      total: totalCount,
    };
  }, [aggregatedData]);

  const getExportData = useCallback(
    () =>
      getChartExportData(
        viewMode === 'organization'
          ? translate('Organization')
          : viewMode === 'country'
            ? translate('Country')
            : translate('Category'),
        chartData,
      ),
    [viewMode, chartData],
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
    () => Math.min(400, Math.max(200, chartData.length * 35)),
    [chartData],
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

      <SummaryWidget
        stats={[
          { label: translate('Total users'), value: total },
          { label: translate('Organizations'), value: orgOptions.length },
          { label: translate('Countries'), value: countryOptions.length },
          {
            label: translate('Affiliations (filtered)'),
            value: filteredData.length,
          },
        ]}
      />

      <Row className="mb-3">
        <Col>
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
              <BarChart
                ref={ref}
                data={chartData}
                horizontal={true}
                height={`${chartHeight}px`}
                showValueLabel={true}
                isSorted={false}
                labelFormatter={(params: any) => {
                  const percent =
                    total > 0 ? ((params.value / total) * 100).toFixed(1) : 0;
                  return `${percent}%`;
                }}
                tooltipFormatter={(params: any) => {
                  const param = params[0];
                  const percent =
                    total > 0 ? ((param.value / total) * 100).toFixed(1) : 0;
                  return `${param.name}: ${param.value.toLocaleString()} (${percent}%)`;
                }}
              />
            )}
          </ChartCard>
        </Col>
      </Row>

      <Row>
        <Col>
          <ChartCard
            title={translate('Affiliation details')}
            getExportData={() =>
              getSimpleExportData(
                tableColumns,
                filteredData.sort((a, b) => b.count - a.count),
              )
            }
            showPNG={false}
            isEmpty={!filteredData || filteredData.length === 0}
          >
            {() => (
              <SimpleTable<AffiliationWithCount>
                columns={tableColumns}
                rows={filteredData.sort((a, b) => b.count - a.count)}
              />
            )}
          </ChartCard>
        </Col>
      </Row>
    </>
  );
};
