import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { refreshSupportUsers } from './api';
import { AsyncSelectField } from './AsyncSelectField';

const filterOptions = options => options;

export const AssigneeGroup = ({ disabled }) => (
  <FormGroup>
    <Col sm={3} componentClass={ControlLabel}>
      {translate('Assigned to')}
    </Col>
    <Col sm={6}>
      <Field
        name="assignee"
        component={AsyncSelectField}
        placeholder={translate('Select assignee...')}
        clearable={true}
        loadOptions={refreshSupportUsers}
        valueKey="name"
        labelKey="name"
        disabled={disabled}
        filterOptions={filterOptions}
      />
    </Col>
  </FormGroup>
);
