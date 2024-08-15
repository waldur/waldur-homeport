import Markdown from 'markdown-to-jsx';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

export const UserAgreementsExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => (
  <Row>
    <Col sm={8}>
      <Markdown>{row.content}</Markdown>
    </Col>
  </Row>
);
