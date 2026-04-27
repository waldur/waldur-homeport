import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { ActiveUsersByProviderChart } from './growth/ActiveUsersByProviderChart';
import { ProjectsOverTimeChart } from './growth/ProjectsOverTimeChart';
import { ResourcesOverTimeChart } from './growth/ResourcesOverTimeChart';
import { TopOfferingsTable } from './growth/TopOfferingsTable';
import { TopProvidersTable } from './growth/TopProvidersTable';
import { UsersOverTimeChart } from './growth/UsersOverTimeChart';
import { ReportingTitle } from './ReportingTitle';
import { useGrowthStatistics } from './useGrowthStatistics';

export const GrowthPage: FC = () => {
  const { data, isLoading, error, refetch } = useGrowthStatistics();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;

  return (
    <>
      <ReportingTitle reportKey="growth" hideTitle />
      <SummaryWidget
        stats={[
          {
            label: translate('Service providers'),
            value: data?.providersCount || 0,
          },
          { label: translate('Offerings'), value: data?.offeringsCount || 0 },
          {
            label: translate('Active users'),
            value: data?.activeUsersCount || 0,
          },
          {
            label: translate('Active projects'),
            value: data?.projectsCount || 0,
          },
          {
            label: translate('Active resources'),
            value: data?.resourcesCount || 0,
          },
        ]}
      />

      <Row className="g-5 mb-5">
        <Col lg={6}>
          <UsersOverTimeChart data={data?.userTrends} />
        </Col>
        <Col lg={6}>
          <ProjectsOverTimeChart data={data?.projectTrends} />
        </Col>
      </Row>

      <Row className="g-5 mb-5">
        <Col lg={6}>
          <ResourcesOverTimeChart data={data?.resourceTrends} />
        </Col>
        <Col lg={6}>
          <ActiveUsersByProviderChart data={data?.activeUsers} />
        </Col>
      </Row>

      <Row className="g-5 mb-5">
        <Col lg={6}>
          <TopProvidersTable data={data?.topProviders} />
        </Col>
        <Col lg={6}>
          <TopOfferingsTable data={data?.topOfferings} />
        </Col>
      </Row>
    </>
  );
};
