import React from 'react';
import { Card } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

interface CallCountCardProps {
  title: string;
  value: number;
  to?: { state: string; params?: object };
}

export const CallCountCard: React.FC<CallCountCardProps> = ({
  title,
  value,
  to,
}) => (
  <Card className="mb-6">
    <Card.Body className="d-flex d-md-block justify-content-between align-items-center">
      {to && (
        <div className="buttons text-end order-2">
          <Link state={to.state} params={to.params} className="btn btn-light">
            {translate('View all')}
          </Link>
        </div>
      )}
      <div className="mb-4 order-1">
        <strong className="d-block display-4 text-success">{value}</strong>
        <strong className="d-block mb-2">{title}</strong>
      </div>
    </Card.Body>
  </Card>
);
