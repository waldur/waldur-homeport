import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

export interface FieldProps {
  label: string;
  helpText?: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  valueClass?: string;
}

export const Field: FunctionComponent<FieldProps> = (props) =>
  props.value || props.children ? (
    <Row className="m-b-xs">
      <Col sm={3}>
        {props.label.length > 20 ? (
          <Tip label={props.label} id="fieldLabel">
            {props.label}:
          </Tip>
        ) : (
          props.label
        )}
      </Col>
      <Col sm={9} className={props.valueClass}>
        {props.value || props.children}
        {props.helpText && (
          <Tip label={props.helpText} id="fieldHelpText">
            {' '}
            <i className="fa fa-question-circle" />
          </Tip>
        )}
      </Col>
    </Row>
  ) : null;
