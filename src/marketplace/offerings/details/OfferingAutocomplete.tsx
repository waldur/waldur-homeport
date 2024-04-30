import { FC } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field, Validator } from 'redux-form';

import { FieldError } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { AutocompleteField } from '@waldur/marketplace/landing/AutocompleteField';

interface OfferingAutocompleteProps {
  offeringFilter?: object;
  providerOfferings?: boolean;
  className?: string;
  reactSelectProps?: Partial<SelectProps>;
  onChange?(value): any;
  showError?: boolean;
  validate?: Validator | Validator[];
}

export const OfferingAutocomplete: FC<OfferingAutocompleteProps> = ({
  providerOfferings = true,
  ...props
}) => (
  <Field
    name="offering"
    validate={props.validate}
    onChange={props.onChange}
    component={(fieldProps) => (
      <>
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
              providerOfferings,
            )
          }
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No offerings')}
          reactSelectProps={props.reactSelectProps}
        />
        {props.showError && fieldProps.meta.touched && (
          <FieldError error={fieldProps.meta.error} />
        )}
      </>
    )}
  />
);
