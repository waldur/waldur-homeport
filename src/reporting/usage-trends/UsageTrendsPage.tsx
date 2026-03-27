import { DateTime } from 'luxon';
import { FC, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { ReportingTitle } from '../ReportingTitle';

import { GrowthSummaryCards } from './GrowthSummaryCards';
import { UsageTrendChart } from './UsageTrendChart';
import { UsageTrendsFilter } from './UsageTrendsFilter';
import { useUsageTrends } from './useUsageTrends';
import { YearOverYearChart } from './YearOverYearChart';

export const UsageTrendsPage: FC = () => {
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
      <ReportingTitle reportKey="usage-trends">
        <UsageTrendsFilter
          year={year}
          onYearChange={setYear}
          availableYears={availableYears}
        />
      </ReportingTitle>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <>
          <GrowthSummaryCards stats={growthStats} year={year} />

          <Row className="g-6 mb-6">
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
