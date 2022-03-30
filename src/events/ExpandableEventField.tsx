import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';

interface ExpandableEventFieldProps {
  label: string;
  value: React.ReactNode;
  state?: string;
  params?: {};
}

export const ExpandableEventField: FunctionComponent<ExpandableEventFieldProps> =
  (props) => {
    let value = props.value;
    if (!value) {
      return null;
    }
    if (props.state) {
      value = <Link state={props.state} params={props.params} label={value} />;
    }
    return (
      <Row className="m-b-xs">
        <Col sm={3}>{props.label}</Col>
        <Col sm={9}>{value}</Col>
      </Row>
    );
  };
