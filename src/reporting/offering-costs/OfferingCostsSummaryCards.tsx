import {
  CurrencyCircleDollarIcon,
  PackageIcon,
  ChartBarIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { OfferingCostsSummary } from './types';

interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
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
        <div className="fs-2 fw-bold">{value}</div>
        <div className="text-muted fs-7">{label}</div>
      </div>
    </div>
  </div>
);

interface OfferingCostsSummaryCardsProps {
  summary: OfferingCostsSummary;
}

export const OfferingCostsSummaryCards: FC<OfferingCostsSummaryCardsProps> = ({
  summary,
}) => {
  return (
    <Row className="g-4 mb-6">
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<CurrencyCircleDollarIcon size={24} weight="bold" />}
          iconColor="#009ef7"
          label={translate('Total cost')}
          value={defaultCurrency(summary.totalCost) ?? ''}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<PackageIcon size={24} weight="bold" />}
          iconColor="#50cd89"
          label={translate('Offerings')}
          value={summary.offeringCount}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<ChartBarIcon size={24} weight="bold" />}
          iconColor="#7239ea"
          label={translate('Average cost')}
          value={defaultCurrency(summary.averageCost) ?? ''}
        />
      </Col>
    </Row>
  );
};
