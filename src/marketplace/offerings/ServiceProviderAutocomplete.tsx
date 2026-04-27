import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { BaseFieldProps, Field } from 'redux-form';

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
  validator?: BaseFieldProps['validate'];
  onChange?(value: any): void;
}

export const ServiceProviderAutocomplete: FunctionComponent<
  ServiceProviderAutocompleteProps
> = (props) => (
  <Field
    name={props.name || 'organization'}
    validate={props.validator}
    onChange={props.onChange}
    component={(fieldProps) => (
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
        className="metronic-select-container"
        classNamePrefix="metronic-select"
        {...props.reactSelectProps}
      />
    )}
  />
);
