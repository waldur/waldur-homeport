import React from 'react';
import { Field } from 'react-final-form';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';

interface ProviderAutocompleteProps {
  reactSelectProps?: any;
}

export const ProviderAutocomplete: React.FC<ProviderAutocompleteProps> = (
  props,
) => {
  const renderComponent = (fieldProps) => (
    <AsyncSelect
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
