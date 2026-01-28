import {
  FolderIcon,
  GraduationCapIcon,
  BuildingsIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ClassificationSummary } from './types';

interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: number;
  subtitle?: string;
}

const StatCard: FC<StatCardProps> = ({
  icon,
  iconColor,
  label,
  value,
  subtitle,
}) => (
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
        {subtitle && <div className="text-muted fs-8">{subtitle}</div>}
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
  const academicPercent =
    summary.totalProjects > 0
      ? Math.round((summary.academicProjects / summary.totalProjects) * 100)
      : 0;
  const industryPercent =
    summary.totalProjects > 0
      ? Math.round((summary.industryProjects / summary.totalProjects) * 100)
      : 0;

  return (
    <Row className="g-4 mb-6">
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<FolderIcon size={24} weight="bold" />}
          iconColor="#009ef7"
          label={translate('Total projects')}
          value={summary.totalProjects}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<GraduationCapIcon size={24} weight="bold" />}
          iconColor="#50cd89"
          label={translate('Academic projects')}
          value={summary.academicProjects}
          subtitle={`${academicPercent}%`}
        />
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <StatCard
          icon={<BuildingsIcon size={24} weight="bold" />}
          iconColor="#7239ea"
          label={translate('Industry projects')}
          value={summary.industryProjects}
          subtitle={`${industryPercent}%`}
        />
      </Col>
    </Row>
  );
};
