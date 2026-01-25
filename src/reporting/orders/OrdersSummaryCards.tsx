import {
  CheckCircleIcon,
  ClockIcon,
  GearIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { OrderStatsSummary } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

interface StatCardProps {
  icon: React.ReactNode;
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

interface OrdersSummaryCardsProps {
  stats: OrderStatsSummary;
}

export const OrdersSummaryCards: FC<OrdersSummaryCardsProps> = ({ stats }) => {
  return (
    <Row className="g-4 mb-6">
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<ShoppingCartIcon size={24} weight="bold" />}
          iconColor="#009ef7"
          label={translate('Total orders')}
          value={stats.total}
        />
      </Col>
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<ClockIcon size={24} weight="bold" />}
          iconColor="#ffc700"
          label={translate('Pending')}
          value={stats.pending}
        />
      </Col>
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<GearIcon size={24} weight="bold" />}
          iconColor="#009ef7"
          label={translate('Executing')}
          value={stats.executing}
        />
      </Col>
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<CheckCircleIcon size={24} weight="bold" />}
          iconColor="#50cd89"
          label={translate('Completed')}
          value={stats.done}
        />
      </Col>
      <Col xs={12} sm={6} lg>
        <StatCard
          icon={<XCircleIcon size={24} weight="bold" />}
          iconColor="#f1416c"
          label={translate('Rejected/Canceled')}
          value={stats.rejected + stats.canceled}
        />
      </Col>
    </Row>
  );
};
