import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const getOptions = () => [
  { value: true, label: translate('Yes') },
  { value: false, label: translate('No') },
  { value: undefined, label: translate('All') },
];

export const ServiceProviderFilter = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Service provider')}</label>
    <Field
      name="service_provider"
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
  </div>
);
