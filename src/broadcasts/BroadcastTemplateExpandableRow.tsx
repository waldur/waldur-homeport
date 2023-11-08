import Markdown from 'markdown-to-jsx';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { BroadcastResponseData } from './types';

export const BroadcastTemplateExpandableRow: FunctionComponent<{
  row: BroadcastResponseData;
}> = ({ row }) => (
  <Row>
    <Col sm={8}>
      <Markdown>{row.body}</Markdown>
    </Col>
  </Row>
);
