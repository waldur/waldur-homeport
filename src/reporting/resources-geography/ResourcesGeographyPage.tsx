import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ResourcesByCountryChart } from './ResourcesByCountryChart';
import { ResourcesByOfferingTable } from './ResourcesByOfferingTable';
import { ResourcesByOrgGroupChart } from './ResourcesByOrgGroupChart';
import { ResourcesGeographySummaryCards } from './ResourcesGeographySummaryCards';
import {
  useResourcesGeographyStats,
  useResourcesGeographySummary,
} from './useResourcesGeographyStats';

export const ResourcesGeographyPage: FC = () => {
  useTitle(translate('Geographic distribution'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'resources-geography',
  });

  const { data, isLoading, error, refetch } = useResourcesGeographyStats();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useResourcesGeographySummary();

  if (isLoading || summaryLoading) {
    return <LoadingSpinner />;
  }

  if (error || summaryError) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!data || !summary || summary.totalResources === 0) {
    return (
      <NoResult
        title={translate('No resources found')}
        message={translate('There are no active resources to display.')}
        callback={() => refetch()}
        buttonTitle={translate('Refresh')}
      />
    );
  }

  return (
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4 mb-6">
        <h1 className="mb-0 fs-1x">{translate('Geographic distribution')}</h1>
      </div>

      <ResourcesGeographySummaryCards summary={summary} />

      <Row className="g-6 mb-6">
        <Col xs={12} lg={6}>
          <ResourcesByCountryChart data={data.byCountry} />
        </Col>
        <Col xs={12} lg={6}>
          <ResourcesByOrgGroupChart data={data.byOrgGroup} />
        </Col>
      </Row>

      <Row>
        <Col>
          <ResourcesByOfferingTable data={data.byOffering} />
        </Col>
      </Row>
    </>
  );
};
