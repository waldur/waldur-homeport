import React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { AutocompleteField } from '@waldur/marketplace/landing/AutocompleteField';

interface OfferingAutocompleteProps {
  offeringFilter?: object;
  className?: string;
}

export const OfferingAutocomplete: React.FC<OfferingAutocompleteProps> = (
  props,
) => (
  <Field
    name="offering"
    component={(fieldProps) => (
      <AutocompleteField
        placeholder={translate('Select offering...')}
        loadOfferings={(query, prevOptions, { page }) =>
          offeringsAutocomplete(
            {
              name: query,
              ...props.offeringFilter,
            },
            prevOptions,
            page,
          )
        }
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No offerings')}
      />
    )}
  />
);
