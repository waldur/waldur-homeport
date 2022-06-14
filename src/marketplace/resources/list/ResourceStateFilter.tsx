import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const getStates = () => [
  { value: 'Creating', label: translate('Creating') },
  { value: 'OK', label: translate('OK') },
  { value: 'Erred', label: translate('Erred') },
  { value: 'Updating', label: translate('Updating') },
  { value: 'Terminating', label: translate('Terminating') },
  { value: 'Terminated', label: translate('Terminated') },
];

export const ResourceStateFilter: FunctionComponent = () => (
  <Form.Group className="col-sm-3">
    <Form.Label>{translate('State')}</Form.Label>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={getStates()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
        />
      )}
    />
  </Form.Group>
);
