import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { AutocompleteField } from '@waldur/marketplace/landing/AutocompleteField';

export const OfferingAutocomplete = (props: {offeringFilter?: object}) => (
  <div className="form-group col-sm-3">
    <label className="control-label">
      {translate('Offering')}
    </label>
    <Field
      name="offering"
      component={fieldProps => (
        <AutocompleteField
          placeholder={translate('Select offering...')}
          loadOfferings={query => offeringsAutocomplete({
            name: query,
            ...props.offeringFilter,
          })}
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
        />
      )}
    />
  </div>
);
