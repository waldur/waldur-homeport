import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import { translate } from '@waldur/i18n';

import { TypeField } from './TypeField';

export const TypeGroup = ({ issueTypes, disabled }) => (
  <FormGroup>
    <Col sm={3} componentClass={ControlLabel}>
      {translate('Request type')}
      <span className="text-danger">*</span>
    </Col>
    <Col sm={6}>
      <TypeField issueTypes={issueTypes} disabled={disabled} />
    </Col>
  </FormGroup>
);
