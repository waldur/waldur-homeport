import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const getOptions = () => [
  { value: true, label: translate('Yes') },
  { value: false, label: translate('No') },
  { value: undefined, label: translate('All') },
];

export const ServiceProviderFilter: FunctionComponent = () => (
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
);
