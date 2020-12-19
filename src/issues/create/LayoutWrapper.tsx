import { FunctionComponent } from 'react';
import { Col, ControlLabel, FormGroup } from 'react-bootstrap';

export const LayoutWrapper: FunctionComponent<{ layout; header; body }> = ({
  layout,
  header,
  body,
}) =>
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
