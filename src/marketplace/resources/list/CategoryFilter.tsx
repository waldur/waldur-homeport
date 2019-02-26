import * as React from 'react';
import { Async } from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { categoryAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const CategoryFilter: React.SFC<{}> = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">
      {translate('Category')}
    </label>
    <Field
      name="category"
      component={fieldProps => (
        <Async
          placeholder={translate('Select category...')}
          loadOptions={categoryAutocomplete}
          valueKey="uuid"
          labelKey="title"
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
        />
      )}
    />
  </div>
);
