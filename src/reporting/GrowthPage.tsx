import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { ActiveUsersByProviderChart } from './growth/ActiveUsersByProviderChart';
import { ProjectsOverTimeChart } from './growth/ProjectsOverTimeChart';
import { ResourcesOverTimeChart } from './growth/ResourcesOverTimeChart';
import { RevenueGrowthChart } from './growth/RevenueGrowthChart';
import { TopOfferingsTable } from './growth/TopOfferingsTable';
import { TopProvidersTable } from './growth/TopProvidersTable';
import { UsersOverTimeChart } from './growth/UsersOverTimeChart';
import { useReportBreadcrumbs } from './ReportsBreadcrumbs';
import { useGrowthStatistics } from './useGrowthStatistics';

export const GrowthPage: FC = () => {
  useTitle(translate('Growth report'));
  useReportBreadcrumbs({
    category: 'financial',
    currentReport: 'growth',
  });

  const { data, isLoading, error, refetch } = useGrowthStatistics();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;

  return (
    <div className="container-fluid py-6">
      <div className="mb-6">
        <RevenueGrowthChart />
      </div>

      <Row className="g-6 mb-6">
        <Col lg={6}>
          <UsersOverTimeChart data={data?.userTrends} />
        </Col>
        <Col lg={6}>
          <ProjectsOverTimeChart data={data?.projectTrends} />
        </Col>
      </Row>

      <Row className="g-6 mb-6">
        <Col lg={6}>
          <ResourcesOverTimeChart data={data?.resourceTrends} />
        </Col>
        <Col lg={6}>
          <ActiveUsersByProviderChart data={data?.activeUsers} />
        </Col>
      </Row>

      <Row className="g-6">
        <Col lg={6}>
          <TopProvidersTable data={data?.topProviders} />
        </Col>
        <Col lg={6}>
          <TopOfferingsTable data={data?.topOfferings} />
        </Col>
      </Row>
    </div>
  );
};
