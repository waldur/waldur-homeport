import Markdown from 'markdown-to-jsx';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { UserAgreementsFormData } from '@waldur/administration/UserAgreementsForm';

export const UserAgreementsExpandableRow: FunctionComponent<{
  row: UserAgreementsFormData;
}> = ({ row }) => (
  <Row>
    <Col sm={8}>
      <Markdown>{row.content}</Markdown>
    </Col>
  </Row>
);
