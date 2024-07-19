import React from 'react';
import { Field } from 'redux-form';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { providerCustomerAutocomplete } from './autocompletes';

interface ProviderCustomerFilterProps {
  provider_uuid?: string;
}

export const ProviderCustomerFilter: React.FC<ProviderCustomerFilterProps> = (
  props,
) => (
  <Field
    name="customer"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select organization...')}
        loadOptions={(query, prevOptions, { page }) =>
          providerCustomerAutocomplete(
            props.provider_uuid,
            query,
            prevOptions,
            page,
          )
        }
        defaultOptions
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No organizations')}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
