import React from 'react';
import { Field } from 'redux-form';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { providerProjectAutocomplete } from './autocompletes';

interface ProviderProjectFilterProps {
  provider_uuid?: string;
}

export const ProviderProjectFilter: React.FC<ProviderProjectFilterProps> = (
  props,
) => (
  <Field
    name="project"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select project...')}
        loadOptions={(query, prevOptions, { page }) =>
          providerProjectAutocomplete(
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
        noOptionsMessage={() => translate('No projects')}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
