import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BroadcastMessage } from 'waldur-js-client';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const BroadcastTemplateExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <ExpandableContainer>
    <Row>
      <Col sm={8}>
        <SafeMarkdown text={row.body} />
      </Col>
    </Row>
  </ExpandableContainer>
);
