import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

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
          <Row>
            <Col>
              <p>{translate('Consumer rejection reason')}:</p>
              <pre>{order.consumer_rejection_comment}</pre>
            </Col>
          </Row>
        )}
        {order.provider_rejection_comment && (
          <Row>
            <Col>
              <p>{translate('Provider rejection reason')}:</p>
              <pre>{order.provider_rejection_comment}</pre>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};
