import { DateTime } from 'luxon';
import { FC, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

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
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>{translate('Filters')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <UsageTrendsFilter
            year={year}
            onYearChange={setYear}
            availableYears={availableYears}
          />
        </Card.Body>
      </Card>

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
