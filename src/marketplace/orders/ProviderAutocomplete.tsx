import React from 'react';
import { Field } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const ProviderAutocomplete: React.FC = () => (
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
        additional={{
          page: 1,
        }}
      />
    )}
  />
);
