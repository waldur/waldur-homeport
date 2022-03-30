import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const getStates = () => [
  { value: 'Draft', label: translate('Draft') },
  { value: 'Active', label: translate('Active') },
  { value: 'Paused', label: translate('Paused') },
  { value: 'Archived', label: translate('Archived') },
];

export const OfferingStateFilter: FunctionComponent = () => (
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
          isMulti={true}
          isClearable={true}
        />
      )}
    />
  </Form.Group>
);
