import { FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { refreshSupportUsers } from './api';
import { AsyncSelectField } from './AsyncSelectField';

const filterOption = (options) => options;

export const AssigneeGroup: FunctionComponent<{ disabled }> = ({
  disabled,
}) => (
  <Form.Group>
    <Col sm={3} as={Form.Label}>
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
  </Form.Group>
);
