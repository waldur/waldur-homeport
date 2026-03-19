import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ClassificationSummary } from './types';

interface StatCardProps {
  label: string;
  value: number;
  subtitle?: string;
}

const StatCard: FC<StatCardProps> = ({ label, value }) => (
  <div className="card card-flush card-bordered h-100">
    <div className="card-body d-flex py-5 flex-column">
      <div className="fs-4 fw-bold">{label}</div>
      <div className="mt-3">
        <h1 style={{ fontSize: '32px' }}>{value}</h1>
      </div>
    </div>
  </div>
);

interface ClassificationSummaryCardsProps {
  summary: ClassificationSummary;
}

export const ClassificationSummaryCards: FC<
  ClassificationSummaryCardsProps
> = ({ summary }) => {
  return (
    <Row className="g-4 mb-6">
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          label={translate('Total projects')}
          value={summary.totalProjects}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          label={translate('Academic projects')}
          value={summary.academicProjects}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          label={translate('Industry projects')}
          value={summary.industryProjects}
        />
      </Col>
    </Row>
  );
};
