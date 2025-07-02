import { FC } from 'react';
import { FormText } from 'react-bootstrap';
import { Props as SelectProps } from 'react-select';
import { Field, Validator } from 'redux-form';
import {
  MarketplaceProviderOfferingsListData,
  MarketplacePublicOfferingsListData,
} from 'waldur-js-client';

import { FieldError } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  providerOfferingsAutocomplete,
  publicOfferingsAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { AutocompleteField } from '@waldur/marketplace/landing/AutocompleteField';

interface OfferingAutocompleteProps {
  offeringFilter?: object;
  name?: string;
  field?: (
    | MarketplacePublicOfferingsListData
    | MarketplaceProviderOfferingsListData
  )['query']['field'];
  providerOfferings?: boolean;
  className?: string;
  description?: string;
  reactSelectProps?: Partial<SelectProps>;
  onChange?(value): any;
  showError?: boolean;
  validate?: Validator | Validator[];
}

export const OfferingAutocomplete: FC<OfferingAutocompleteProps> = ({
  providerOfferings = true,
  name = 'offering',
  field,
  ...props
}) => (
  <Field
    name={name}
    validate={props.validate}
    onChange={props.onChange}
    component={(fieldProps) => (
      <>
        <AutocompleteField
          placeholder={translate('Select offering...')}
          loadOfferings={(query, prevOptions, { page }) =>
            providerOfferings
              ? providerOfferingsAutocomplete(
                  {
                    name: query,
                    ...props.offeringFilter,
                  },
                  prevOptions,
                  page,
                  field as any,
                )
              : publicOfferingsAutocomplete(
                  {
                    name: query,
                    ...props.offeringFilter,
                  },
                  prevOptions,
                  page,
                  field as any,
                )
          }
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No offerings')}
          reactSelectProps={props.reactSelectProps}
        />

        {props.description && (
          <FormText className="text-muted">{props.description}</FormText>
        )}
        {props.showError && fieldProps.meta.touched && (
          <FieldError error={fieldProps.meta.error} />
        )}
      </>
    )}
  />
);
