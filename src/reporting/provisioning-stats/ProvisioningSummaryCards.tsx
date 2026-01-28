import {
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ProvisioningSummary } from './types';

interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: number;
}

const StatCard: FC<StatCardProps> = ({ icon, iconColor, label, value }) => (
  <div className="card card-flush h-100">
    <div className="card-body d-flex align-items-center py-5">
      <div
        className="d-flex align-items-center justify-content-center rounded-circle me-4"
        style={{
          width: 50,
          height: 50,
          backgroundColor: `${iconColor}15`,
        }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div>
        <div className="fs-2 fw-bold">{value.toLocaleString()}</div>
        <div className="text-muted fs-7">{label}</div>
      </div>
    </div>
  </div>
);

interface ProvisioningSummaryCardsProps {
  summary: ProvisioningSummary;
}

export const ProvisioningSummaryCards: FC<ProvisioningSummaryCardsProps> = ({
  summary,
}) => {
  return (
    <Row className="g-4 mb-6">
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<ShoppingCartIcon size={24} weight="bold" />}
          iconColor="#009ef7"
          label={translate('Total orders')}
          value={summary.totalOrders}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<CheckCircleIcon size={24} weight="bold" />}
          iconColor="#50cd89"
          label={translate('Successful orders')}
          value={summary.successfulOrders}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<XCircleIcon size={24} weight="bold" />}
          iconColor="#f1416c"
          label={translate('Failed orders')}
          value={summary.failedOrders}
        />
      </Col>
    </Row>
  );
};
