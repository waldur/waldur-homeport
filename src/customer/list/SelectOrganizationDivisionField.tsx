import * as React from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Field } from 'redux-form';

import { organizationDivisionAutocomplete } from '@waldur/customer/list/api';
import { translate } from '@waldur/i18n';

export const SelectOrganizationDivisionField = () => (
  <div className="form-group">
    <label className="control-label col-sm-2">{translate('Division')}</label>
    <div className="col-sm-8">
      <Field
        name="division"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Select division...')}
            loadOptions={organizationDivisionAutocomplete}
            defaultOptions
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.name}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            noOptionsMessage={() => translate('No divisions')}
            isClearable={true}
            additional={{
              page: 1,
            }}
          />
        )}
      />
    </div>
  </div>
);
