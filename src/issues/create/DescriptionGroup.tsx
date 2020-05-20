import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { InputField } from './InputField';

export const DescriptionGroup = ({ disabled }) => (
  <FormGroup>
    <Col sm={3} componentClass={ControlLabel}>
      {translate('Description')}
      <span className="text-danger">*</span>
    </Col>
    <Col sm={6}>
      <Field
        name="description"
        component={InputField}
        componentClass="textarea"
        required={true}
        disabled={disabled}
      />
    </Col>
  </FormGroup>
);
