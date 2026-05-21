import React from 'react';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';

import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';

interface ProviderAutocompleteProps {
  reactSelectProps?: Partial<SelectProps>;
}

export const ProviderAutocomplete: React.FC<ProviderAutocompleteProps> = (
  props,
) => {
  const renderComponent = (fieldProps) => (
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
      {...props.reactSelectProps}
    />
  );

  return <Field name="provider" component={renderComponent} />;
};
