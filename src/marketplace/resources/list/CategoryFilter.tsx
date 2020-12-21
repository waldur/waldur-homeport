import React from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { categoryAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const CategoryFilter: React.FC = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Category')}</label>
    <Field
      name="category"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={translate('Select category...')}
          loadOptions={categoryAutocomplete}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.title}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No categories')}
          isClearable={true}
          additional={{
            page: 1,
          }}
        />
      )}
    />
  </div>
);
