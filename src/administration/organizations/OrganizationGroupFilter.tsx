import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { organizationGroupTypeAutocomplete } from './api';

export const OrganizationGroupFilter: FunctionComponent = () => (
  <Field
    name="organization_group_type"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select organization group type...')}
        loadOptions={organizationGroupTypeAutocomplete}
        defaultOptions
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No organization group types')}
        isMulti={true}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
