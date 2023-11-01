import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { NotificationResponseData } from './types';

export const NotificationTemplateExpandableRow: FunctionComponent<{
  row: NotificationResponseData;
}> = ({ row }) => (
  <Row>
    <Col sm={8}>
      <p>{row.body}</p>
    </Col>
  </Row>
);
