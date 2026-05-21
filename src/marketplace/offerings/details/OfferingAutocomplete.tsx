import { FieldValidator } from 'final-form';
import { FC } from 'react';
import { FormText } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';
import {
  MarketplaceProviderOfferingsListData,
  MarketplacePublicOfferingsListData,
} from 'waldur-js-client';

import { FieldError } from '@/form';
import { translate } from '@/i18n';
import {
  providerOfferingsAutocomplete,
  publicOfferingsAutocomplete,
} from '@/marketplace/common/autocompletes';
import { AutocompleteField } from '@/marketplace/landing/AutocompleteField';

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
  validate?: FieldValidator<any>;
}

export const OfferingAutocomplete: FC<OfferingAutocompleteProps> = ({
  providerOfferings = true,
  name = 'offering',
  field,
  ...props
}) => {
  const renderComponent = (fieldProps) => (
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
        onChange={(value) => {
          fieldProps.input.onChange(value);
          if (props.onChange) {
            props.onChange(value);
          }
        }}
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
  );

  return (
    <Field name={name} validate={props.validate} component={renderComponent} />
  );
};
