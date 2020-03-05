import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { AutocompleteField } from '@waldur/marketplace/landing/AutocompleteField';

interface Props {
  offeringFilter?: object;
  className?: string;
}

export const OfferingAutocomplete: React.FC<Props> = props => (
  <div className={`form-group ${props.className}`}>
    <label className="control-label">{translate('Offering')}</label>
    <Field
      name="offering"
      component={fieldProps => (
        <AutocompleteField
          placeholder={translate('Select offering...')}
          loadOfferings={query =>
            offeringsAutocomplete({
              name: query,
              ...props.offeringFilter,
            })
          }
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
        />
      )}
    />
  </div>
);

OfferingAutocomplete.defaultProps = {
  className: 'col-sm-3',
};
