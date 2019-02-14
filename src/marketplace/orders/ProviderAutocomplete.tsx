import * as React from 'react';
import { Async } from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const ProviderAutocomplete = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">
      {translate('Service provider')}
    </label>
    <Field
      name="provider"
      component={fieldProps => (
        <Async
          placeholder={translate('Select provider...')}
          loadOptions={providerAutocomplete}
          valueKey="customer_uuid"
          labelKey="customer_name"
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
        />
      )}
    />
  </div>
);
