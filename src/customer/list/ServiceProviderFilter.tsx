import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const getOptions = () => [
  { value: true, label: translate('Yes') },
  { value: false, label: translate('No') },
  { value: undefined, label: translate('All') },
];

export const ServiceProviderFilter: FunctionComponent = () => (
  <Form.Group className="col-sm-3">
    <Form.Label>{translate('Service provider')}</Form.Label>
    <Field
      name="is_service_provider"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select service provider...')}
          options={getOptions()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
        />
      )}
    />
  </Form.Group>
);
