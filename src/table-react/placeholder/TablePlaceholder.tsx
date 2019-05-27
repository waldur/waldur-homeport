import * as React from 'react';
import { Row, Col } from 'react-bootstrap';

import './TablePlaceholder.scss';

export interface TablePlaceholderProps {
  illustration: string;
  children: React.ReactNode;
}

export function TablePlaceholder(props: TablePlaceholderProps) {
  const { illustration, children } = props;
  return (
    <Row className="TablePlaceholder">
      <Col sm={6} smOffset={3}>
        <Row>
          <Col className="TablePlaceholder__img" sm={8} smOffset={2}>
            <img src={illustration} alt="Empty table illustration"/>
          </Col>
        </Row>
        <Row>
          <Col className="TablePlaceholder__body">{children}</Col>
        </Row>
      </Col>
    </Row>
  );
}
