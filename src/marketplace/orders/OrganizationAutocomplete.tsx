import * as React from 'react';
import AsyncSelect from 'react-select/async';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const OrganizationAutocomplete = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Client organization')}</label>
    <Field
      name="organization"
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={translate('Select organization...')}
          loadOptions={organizationAutocomplete}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No organizations')}
        />
      )}
    />
  </div>
);
