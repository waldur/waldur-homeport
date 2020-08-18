import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { refreshSupportUsers } from './api';
import { AsyncSelectField } from './AsyncSelectField';

const filterOption = (options) => options;

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
        isClearable={true}
        defaultOptions
        loadOptions={refreshSupportUsers}
        getOptionValue={(option) => option.name}
        getOptionLabel={(option) => option.name}
        isDisabled={disabled}
        filterOption={filterOption}
      />
    </Col>
  </FormGroup>
);
