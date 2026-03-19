import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ResourcesGeographySummary } from './types';

interface StatCardProps {
  label: string;
  value: number;
}

const StatCard: FC<StatCardProps> = ({ label, value }) => (
  <div className="card card-flush card-bordered h-100">
    <div className="card-body d-flex py-5 flex-column">
      <div className="fs-4 fw-bold">{label}</div>
      <div className="flex-grow-1 mt-3">
        <h1 style={{ fontSize: '32px' }}>{value}</h1>
      </div>
    </div>
  </div>
);

interface ResourcesGeographySummaryCardsProps {
  summary: ResourcesGeographySummary;
}

export const ResourcesGeographySummaryCards: FC<
  ResourcesGeographySummaryCardsProps
> = ({ summary }) => {
  return (
    <Row className="g-4 mb-6">
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          label={translate('Total resources')}
          value={summary.totalResources}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          label={translate('Countries')}
          value={summary.countriesWithResources}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          label={translate('Organization groups')}
          value={summary.orgGroupsWithResources}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          label={translate('Offerings')}
          value={summary.offeringsWithResources}
        />
      </Col>
    </Row>
  );
};
