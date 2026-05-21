import { FieldValidator } from 'final-form';
import { FunctionComponent } from 'react';
import { Field as FinalField } from 'react-final-form';
import { Props as SelectProps } from 'react-select';

import { AsyncPaginate } from '@/form/themed-select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';

interface ServiceProviderAutocompleteProps extends FormField {
  name?: string;
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  reactSelectProps?: Partial<SelectProps>;
  validator?: FieldValidator<any>;
  onChange?(value: any): void;
}

export const ServiceProviderAutocomplete: FunctionComponent<
  ServiceProviderAutocompleteProps
> = (props) => {
  const renderComponent = (fieldProps) => (
    <AsyncPaginate
      placeholder={props.placeholder || translate('Select organization...')}
      loadOptions={async (query, prevOptions, { page }) => {
        const result = await providerAutocomplete(query, prevOptions, {
          page,
        });
        return {
          ...result,
          options: result.options.map((option) => ({
            ...option,
            uuid: option.customer_uuid,
            name: option.customer_name,
          })),
        };
      }}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      value={fieldProps.input.value}
      onChange={(value) => fieldProps.input.onChange(value)}
      noOptionsMessage={() =>
        props.noOptionsMessage || translate('No organizations')
      }
      isClearable={true}
      {...props.reactSelectProps}
    />
  );

  return (
    <FinalField
      name={props.name || 'organization'}
      validate={props.validator as any}
      component={renderComponent}
    />
  );
};
