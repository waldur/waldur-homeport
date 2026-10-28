import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';

export const RejectionDetailsTab = ({ order }) => {
  return (
    <Card className="card-bordered">
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Rejection details')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {order.consumer_rejection_comment && (
          <div>
            <p>{translate('Consumer rejection reason')}:</p>
            <pre>{order.consumer_rejection_comment}</pre>
          </div>
        )}
        {order.provider_rejection_comment && (
          <div>
            <p>{translate('Provider rejection reason')}:</p>
            <pre>{order.provider_rejection_comment}</pre>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
