import { BuildingsIcon, ChartBarIcon, StackIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { UsageByOrgTypeSummary } from './types';

interface StatCardProps {
  icon: React.ReactNode;
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

interface Props {
  summary: UsageByOrgTypeSummary;
}

export const UsageByOrgTypeSummaryCards: FC<Props> = ({ summary }) => {
  return (
    <Row className="g-4 mb-6">
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<BuildingsIcon size={24} weight="duotone" />}
          iconColor="#009ef7"
          label={translate('Organization types')}
          value={summary.totalOrgTypes.toLocaleString()}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<StackIcon size={24} weight="duotone" />}
          iconColor="#50cd89"
          label={translate('Total resources')}
          value={summary.totalResources.toLocaleString()}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<ChartBarIcon size={24} weight="duotone" />}
          iconColor="#7239ea"
          label={translate('Total usage')}
          value={summary.totalUsage.toLocaleString()}
        />
      </Col>
    </Row>
  );
};
