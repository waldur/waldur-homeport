import { CheckCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface ProvisioningSuccessRateCardProps {
  successRate: number;
}

export const ProvisioningSuccessRateCard: FC<
  ProvisioningSuccessRateCardProps
> = ({ successRate }) => {
  const getColor = () => {
    if (successRate >= 95) return '#50cd89';
    if (successRate >= 80) return '#ffc700';
    return '#f1416c';
  };

  const color = getColor();

  return (
    <Card className="card-flush">
      <Card.Body className="d-flex align-items-center py-8">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle me-5"
          style={{
            width: 80,
            height: 80,
            backgroundColor: `${color}15`,
          }}
        >
          <CheckCircleIcon size={40} weight="bold" style={{ color }} />
        </div>
        <div>
          <div className="fs-1 fw-bolder" style={{ color }}>
            {successRate}%
          </div>
          <div className="text-muted fs-5">
            {translate('Provisioning success rate')}
          </div>
          <div className="text-muted fs-7">
            {translate('Successful orders out of all completed orders')}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
