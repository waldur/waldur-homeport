import * as React from 'react';
import { Async } from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const OrganizationAutocomplete = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">
      {translate('Client organization')}
    </label>
    <Field
      name="organization"
      component={fieldProps => (
        <Async
          placeholder={translate('Select organization...')}
          loadOptions={organizationAutocomplete}
          valueKey="uuid"
          labelKey="name"
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
        />
      )}
    />
  </div>
);
