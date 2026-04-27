import {
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Card, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { translate } from '@/i18n';

const parseHealthStatus = (status: string) => {
  if (status === 'working') {
    return { isWorking: true, message: 'OK', error: null };
  }

  // Handle error messages like "unavailable: Connection refused error"
  const parts = status.split(': ');
  const statusType = parts[0];
  const errorMessage = parts.slice(1).join(': ') || statusType;

  return {
    isWorking: false,
    message: statusType.toUpperCase(),
    error: errorMessage,
  };
};

const getStatusIcon = (isWorking: boolean, hasError: boolean) => {
  if (isWorking) {
    return <CheckCircleIcon size={24} className="text-success" weight="bold" />;
  }
  return hasError ? (
    <XCircleIcon size={24} className="text-danger" weight="bold" />
  ) : (
    <WarningCircleIcon size={24} className="text-warning" weight="bold" />
  );
};

const getStatusColorClass = (isWorking: boolean) =>
  isWorking ? 'text-success' : 'text-danger';

const HealthInfoItem = ({
  title,
  status,
}: {
  title: string;
  status: string;
}) => {
  const { isWorking, message, error } = parseHealthStatus(status);
  const hasError = Boolean(error);

  const statusContent = (
    <div className="text-center">
      <div className="d-flex justify-content-center align-items-center mb-2">
        {getStatusIcon(isWorking, hasError)}
        <span className={`ms-2 fw-bold ${getStatusColorClass(isWorking)}`}>
          {message}
        </span>
      </div>
      <div className="health-title fw-semibold text-muted small">{title}</div>
    </div>
  );

  if (hasError) {
    return (
      <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-${title}`}>
              <strong>Error:</strong> {error}
            </Tooltip>
          }
        >
          <div className="p-3 border rounded bg-light-danger cursor-pointer h-100">
            {statusContent}
          </div>
        </OverlayTrigger>
      </Col>
    );
  }

  return (
    <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
      <div className="p-3 border rounded bg-light-success h-100">
        {statusContent}
      </div>
    </Col>
  );
};

interface HealthChecksProps {
  healthInfoItems: Record<string, string>;
}

export const HealthChecks = ({ healthInfoItems }: HealthChecksProps) => {
  const healthEntries = Object.entries(healthInfoItems);
  const workingCount = healthEntries.filter(
    ([, status]) => status === 'working',
  ).length;
  const totalCount = healthEntries.length;
  const allWorking = workingCount === totalCount;

  return (
    <Card className="card-bordered mb-5">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">{translate('Health checks')}</h3>
          <div className="d-flex align-items-center">
            {allWorking ? (
              <CheckCircleIcon
                size={20}
                className="text-success me-2"
                weight="bold"
              />
            ) : (
              <XCircleIcon
                size={20}
                className="text-danger me-2"
                weight="bold"
              />
            )}
            <span
              className={`fw-semibold ${allWorking ? 'text-success' : 'text-danger'}`}
            >
              {workingCount}/{totalCount} {translate('services healthy')}
            </span>
          </div>
        </div>
        <div className="row">
          {healthEntries.map(([key, value]) => (
            <HealthInfoItem key={key} title={key} status={value} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};
