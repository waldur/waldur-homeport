import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { InputField } from './InputField';

export const SummaryGroup = ({ disabled }) => (
  <FormGroup>
    <Col sm={3} componentClass={ControlLabel}>
      {translate('Title')}
      <span className="text-danger">*</span>
    </Col>
    <Col sm={6}>
      <Field
        name="summary"
        component={InputField}
        type="text"
        required={true}
        disabled={disabled}
      />
    </Col>
  </FormGroup>
);
