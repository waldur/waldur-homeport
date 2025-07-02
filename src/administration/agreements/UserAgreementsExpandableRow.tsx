import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { UserAgreement } from 'waldur-js-client';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const UserAgreementsExpandableRow: FunctionComponent<{
  row: UserAgreement;
}> = ({ row }) => (
  <ExpandableContainer>
    <Row>
      <Col sm={8}>
        <SafeMarkdown text={row.content} />
      </Col>
    </Row>
  </ExpandableContainer>
);
