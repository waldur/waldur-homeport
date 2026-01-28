import {
  CubeIcon,
  FlagIcon,
  BuildingsIcon,
  PackageIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ResourcesGeographySummary } from './types';

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
          icon={<CubeIcon size={24} weight="bold" />}
          iconColor="#009ef7"
          label={translate('Total resources')}
          value={summary.totalResources}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          icon={<FlagIcon size={24} weight="bold" />}
          iconColor="#50cd89"
          label={translate('Countries')}
          value={summary.countriesWithResources}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          icon={<BuildingsIcon size={24} weight="bold" />}
          iconColor="#7239ea"
          label={translate('Organization groups')}
          value={summary.orgGroupsWithResources}
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <StatCard
          icon={<PackageIcon size={24} weight="bold" />}
          iconColor="#ffc700"
          label={translate('Offerings')}
          value={summary.offeringsWithResources}
        />
      </Col>
    </Row>
  );
};
