import { FieldValidator } from 'final-form';
import { FC, useMemo } from 'react';
import { FormText } from 'react-bootstrap';
import { Field } from 'react-final-form';
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
  reactSelectProps?: any;
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
  const loadPublicOfferings = useMemo(
    () =>
      publicOfferingsAutocomplete({
        ...props.offeringFilter,
        ...(field ? { field: field as any } : {}),
      }),
    [props.offeringFilter, field],
  );

  const loadProviderOfferings = useMemo(
    () =>
      providerOfferingsAutocomplete({
        ...props.offeringFilter,
        ...(field ? { field: field as any } : {}),
      }),
    [props.offeringFilter, field],
  );

  const renderComponent = (fieldProps) => (
    <>
      <AutocompleteField
        placeholder={translate('Select offering...')}
        loadOfferings={
          providerOfferings ? loadProviderOfferings : loadPublicOfferings
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
