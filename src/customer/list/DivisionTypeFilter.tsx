import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { divisionTypeAutocomplete } from '@waldur/customer/list/api';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const DivisionTypeFilter: FunctionComponent = () => (
  <Field
    name="division_type"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select division type...')}
        loadOptions={divisionTypeAutocomplete}
        defaultOptions
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No division types')}
        isMulti={true}
        isClearable={true}
        additional={{
          page: 1,
        }}
      />
    )}
  />
);
