import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { SelectField } from './SelectField';

export const PriorityGroup = ({ priorities, disabled }) => {
  const user = useSelector(getUser);
  if (!user.is_staff && !user.is_support) {
    return null;
  }
  return (
    <FormGroup>
      <Col sm={3} componentClass={ControlLabel}>
        {translate('Priority')}
      </Col>
      <Col sm={6}>
        <Field
          name="priority"
          component={SelectField}
          placeholder={translate('Select priority...')}
          options={priorities}
          disabled={disabled}
          valueKey="name"
          labelKey="name"
        />
      </Col>
    </FormGroup>
  );
};
