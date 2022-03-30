import React from 'react';
import { Form } from 'react-bootstrap';
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
  <div className={`form-group ${props.className}`}>
    <Form.Label>{translate('Offering')}</Form.Label>
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
  </div>
);

OfferingAutocomplete.defaultProps = {
  className: 'col-sm-3',
};
