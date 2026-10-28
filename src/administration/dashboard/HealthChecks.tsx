import {
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Card } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

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
      <div className="flex justify-center items-center mb-1.5">
        {getStatusIcon(isWorking, hasError)}
        <span
          className={`ms-1.5 font-medium ${getStatusColorClass(isWorking)}`}
        >
          {message}
        </span>
      </div>
      <div className="health-title text-secondary small">{title}</div>
    </div>
  );

  if (hasError) {
    return (
      <div className="mb-3">
        <Tooltip
          label={
            <>
              <strong>Error:</strong> {error}
            </>
          }
        >
          <div className="p-2.5 border rounded bg-danger-subtle cursor-pointer h-full">
            {statusContent}
          </div>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div className="p-2.5 border rounded bg-success-subtle h-full">
        {statusContent}
      </div>
    </div>
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
    <Card className="card-bordered mb-4">
      <Card.Body>
        <div className="flex justify-between items-center mb-3">
          <h3 className="mb-0">{translate('Health checks')}</h3>
          <div className="flex items-center">
            {allWorking ? (
              <CheckCircleIcon
                size={20}
                className="text-success me-1.5"
                weight="bold"
              />
            ) : (
              <XCircleIcon
                size={20}
                className="text-danger me-1.5"
                weight="bold"
              />
            )}
            <span className={`${allWorking ? 'text-success' : 'text-danger'}`}>
              {workingCount}/{totalCount} {translate('services healthy')}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5">
          {healthEntries.map(([key, value]) => (
            <HealthInfoItem key={key} title={key} status={value} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};
