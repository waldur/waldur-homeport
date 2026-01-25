import {
  CheckCircleIcon,
  IdentificationCardIcon,
  ShareNetworkIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { UserStatisticsSummary } from '../types';

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sublabel?: string;
}

const SummaryCard: FC<SummaryCardProps> = ({
  icon,
  label,
  value,
  sublabel,
}) => (
  <Card className="h-100">
    <Card.Body className="d-flex align-items-center">
      <div className="symbol symbol-50px me-4">
        <div className="symbol-label bg-light-primary text-primary">{icon}</div>
      </div>
      <div>
        <div className="fs-2 fw-bold text-gray-900">{value}</div>
        <div className="fs-7 text-muted">{label}</div>
        {sublabel && <div className="fs-8 text-muted">{sublabel}</div>}
      </div>
    </Card.Body>
  </Card>
);

interface SummaryCardsProps {
  summary: UserStatisticsSummary;
}

export const SummaryCards: FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <Row className="mb-6 g-4">
      <Col xs={12} sm={6} lg={3}>
        <SummaryCard
          icon={<UsersThreeIcon size={24} weight="bold" />}
          label={translate('Total users')}
          value={summary.totalUsers.toLocaleString()}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <SummaryCard
          icon={<CheckCircleIcon size={24} weight="bold" />}
          label={translate('Active users')}
          value={`${summary.activePercent}%`}
          sublabel={`${summary.activeUsers.toLocaleString()} ${translate('users')}`}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <SummaryCard
          icon={<ShareNetworkIcon size={24} weight="bold" />}
          label={translate('Federated users')}
          value={`${summary.federatedPercent}%`}
          sublabel={`${summary.federatedUsers.toLocaleString()} ${translate('users')}`}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <SummaryCard
          icon={<IdentificationCardIcon size={24} weight="bold" />}
          label={translate('Identity sources')}
          value={summary.identitySourceCount}
        />
      </Col>
    </Row>
  );
};
