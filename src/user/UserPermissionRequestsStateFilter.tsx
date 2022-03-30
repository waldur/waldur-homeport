import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

interface Option {
  value: string;
  label: string;
}

export const getStates = (): Option[] => [
  { value: 'pending', label: translate('Pending') },
  { value: 'approved', label: translate('Approved') },
  { value: 'rejected', label: translate('Rejected') },
];

export const UserPermissionRequestsStateFilter: FunctionComponent = () => (
  <Form.Group>
    <Form.Label>{translate('State')}</Form.Label>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={getStates()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isMulti={true}
          isClearable={true}
        />
      )}
    />
  </Form.Group>
);
