import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

const getStatusLabel = (status) => (status === 'working' ? 'OK' : 'ERROR');
const getStatusColorClass = (status) =>
  status === 'working' ? 'text-success' : 'text-danger';

const HealthInfoItem = ({
  title,
  status,
}: {
  title: string;
  status: string;
}) => (
  <div className="text-center">
    <strong className={'d-block fs-2 ' + getStatusColorClass(status)}>
      {getStatusLabel(status)}
    </strong>
    <strong>{title}</strong>
  </div>
);

interface HealthChecksProps {
  healthInfoItems: Record<string, string>;
}

export const HealthChecks = ({ healthInfoItems }: HealthChecksProps) => {
  return (
    <Card className="mb-6">
      <Card.Body>
        <h3 className="mb-8">{translate('Health checks')}:</h3>
        <div className="d-flex justify-content-around flex-wrap">
          {Object.entries(healthInfoItems).map(([key, value]) => (
            <HealthInfoItem key={key} title={key} status={value} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};
