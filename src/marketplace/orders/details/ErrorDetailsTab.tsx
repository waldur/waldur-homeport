import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

export const ErrorDetailsTab = ({ order }) => {
  return (
    <Card className="card-bordered">
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Error details')}</h3>
        </Card.Title>
      </Card.Header>
      {order.error_message ? (
        <Card.Body>
          <Row>
            <Col>
              <p>{translate('Error details')}:</p>
              <pre>{order.error_message}</pre>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>{translate('Error trace')}:</p>
              <pre>{order.error_traceback}</pre>
            </Col>
          </Row>
        </Card.Body>
      ) : (
        <NoResult
          title={translate('No errors found for this order')}
          message={null}
        />
      )}
    </Card>
  );
};
