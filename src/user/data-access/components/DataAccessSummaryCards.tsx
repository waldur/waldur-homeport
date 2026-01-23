import { Buildings, ShieldCheck, Users } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { DataAccessSummary } from '../types';

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  count: number | null;
  description: string;
}

const SummaryCard: FC<SummaryCardProps> = ({
  icon,
  title,
  count,
  description,
}) => (
  <Card className="card-bordered h-100">
    <Card.Body className="d-flex align-items-center gap-4">
      <div className="text-primary">{icon}</div>
      <div>
        <div className="display-6 fw-bold text-dark">
          {count !== null ? count : '-'}
        </div>
        <div className="fw-semibold text-dark">{title}</div>
        <div className="text-muted small">{description}</div>
      </div>
    </Card.Body>
  </Card>
);

interface DataAccessSummaryCardsProps {
  summary: DataAccessSummary;
}

export const DataAccessSummaryCards: FC<DataAccessSummaryCardsProps> = ({
  summary,
}) => (
  <Row className="mb-6 g-4">
    <Col md={6} lg={4}>
      <SummaryCard
        icon={<ShieldCheck size={40} weight="duotone" />}
        title={translate('Administrative access')}
        count={summary.total_administrative_access}
        description={translate('Platform staff with global access')}
      />
    </Col>
    <Col md={6} lg={4}>
      <SummaryCard
        icon={<Users size={40} weight="duotone" />}
        title={translate('Organizational access')}
        count={summary.total_organizational_access}
        description={translate('Users in your organizations')}
      />
    </Col>
    <Col md={6} lg={4}>
      <SummaryCard
        icon={<Buildings size={40} weight="duotone" />}
        title={translate('Service provider access')}
        count={summary.total_provider_access}
        description={translate('Providers with your consent')}
      />
    </Col>
  </Row>
);
