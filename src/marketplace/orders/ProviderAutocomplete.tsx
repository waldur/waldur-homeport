import React from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface ProviderAutocompleteProps {
  reactSelectProps?: Partial<SelectProps>;
}

export const ProviderAutocomplete: React.FC<ProviderAutocompleteProps> = (
  props,
) => (
  <Field
    name="provider"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select provider...')}
        loadOptions={providerAutocomplete}
        defaultOptions
        getOptionValue={(option) => option.customer_uuid}
        getOptionLabel={(option) => option.customer_name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No providers')}
        isClearable={true}
        className="metronic-select-container"
        classNamePrefix="metronic-select"
        {...props.reactSelectProps}
      />
    )}
  />
);
