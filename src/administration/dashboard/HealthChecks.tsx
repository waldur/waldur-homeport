import { Card, Col } from 'react-bootstrap';

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
  <Col xs={6} md={2} className="text-md-center mb-4">
    <strong className={'d-block fs-2 ' + getStatusColorClass(status)}>
      {getStatusLabel(status)}
    </strong>
    <strong className="health-title">{title}</strong>
  </Col>
);

interface HealthChecksProps {
  healthInfoItems: Record<string, string>;
}

export const HealthChecks = ({ healthInfoItems }: HealthChecksProps) => {
  return (
    <Card className="mb-6">
      <Card.Body>
        <h3 className="mb-8">{translate('Health checks')}:</h3>
        <div className="d-flex justify-content-start justify-content-lg-between flex-wrap">
          {Object.entries(healthInfoItems).map(([key, value]) => (
            <HealthInfoItem key={key} title={key} status={value} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};
