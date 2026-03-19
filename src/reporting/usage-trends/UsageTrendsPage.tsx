import { DateTime } from 'luxon';
import { FC, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { GrowthSummaryCards } from './GrowthSummaryCards';
import { UsageTrendChart } from './UsageTrendChart';
import { UsageTrendsFilter } from './UsageTrendsFilter';
import { useUsageTrends } from './useUsageTrends';
import { YearOverYearChart } from './YearOverYearChart';

export const UsageTrendsPage: FC = () => {
  useTitle(translate('Usage trends'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'usage-trends',
  });

  const currentYear = DateTime.now().year;
  const [year, setYear] = useState(currentYear);

  const {
    isLoading,
    error,
    refetch,
    currentYearData,
    comparison,
    growthStats,
    availableYears,
  } = useUsageTrends({
    year,
  });

  return (
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4">
        <h1 className="mb-0 fs-1x">{translate('Usage trends')}</h1>
        <div className="d-none d-sm-flex gap-4">
          <UsageTrendsFilter
            year={year}
            onYearChange={setYear}
            availableYears={availableYears}
          />
        </div>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <>
          <GrowthSummaryCards stats={growthStats} year={year} />

          <Row className="g-4 mb-6">
            <Col xs={12} lg={6}>
              <UsageTrendChart monthlyData={currentYearData} year={year} />
            </Col>
            <Col xs={12} lg={6}>
              <YearOverYearChart comparison={comparison} year={year} />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};
