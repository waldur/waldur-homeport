import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import type { TableGrowthStatsResponse } from './api';
import type { TableAlert } from './utils';

interface TableGrowthOverviewProps {
  data: TableGrowthStatsResponse;
  alerts: TableAlert[];
}

const StatCard: FC<{
  value: ReactNode;
  label: string;
  valueClass?: string;
  extra?: ReactNode;
}> = ({ value, label, valueClass = '', extra }) => (
  <Card className="card-bordered mb-5 h-100">
    <Card.Body>
      <div className="d-flex align-items-center">
        <strong className={`fs-1 ${valueClass}`}>{value}</strong>
        {extra}
      </div>
      <strong className="d-block text-muted">{label}</strong>
    </Card.Body>
  </Card>
);

export const TableGrowthOverview: FC<TableGrowthOverviewProps> = ({
  data,
  alerts,
}) => {
  return (
    <Row className="mb-6">
      <Col md={6} lg={3}>
        <StatCard value={data.date} label={translate('Date')} />
      </Col>

      <Col md={6} lg={3}>
        <StatCard
          value={data.tables.length}
          label={translate('Tables monitored')}
        />
      </Col>

      <Col md={6} lg={3}>
        <StatCard
          value={alerts.length}
          label={translate('Active alerts')}
          valueClass={alerts.length > 0 ? 'text-danger' : 'text-success'}
          extra={
            alerts.length > 0 ? (
              <WarningCircleIcon
                size={24}
                weight="bold"
                className="text-danger ms-2"
              />
            ) : null
          }
        />
      </Col>

      <Col md={6} lg={3}>
        <StatCard
          value={`${data.weekly_threshold_percent}% / ${data.monthly_threshold_percent}%`}
          label={translate('Thresholds (weekly / monthly)')}
        />
      </Col>
    </Row>
  );
};
