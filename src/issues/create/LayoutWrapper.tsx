import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';

export const LayoutWrapper = ({ layout, header, body }) =>
  layout === 'horizontal' ? (
    <FormGroup>
      <Col sm={3} componentClass={ControlLabel}>
        {header}
      </Col>
      <Col sm={6}>{body}</Col>
    </FormGroup>
  ) : (
    <FormGroup>
      <ControlLabel>{header}</ControlLabel>
      {body}
    </FormGroup>
  );
