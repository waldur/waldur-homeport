import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { BaseFieldProps, Field } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface OrganizationAutocompleteProps extends FormField {
  name?: string;
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  reactSelectProps?: Partial<SelectProps>;
  validator?: BaseFieldProps['validate'];
  onChange?(value: any): void;
}

export const OrganizationAutocomplete: FunctionComponent<
  OrganizationAutocompleteProps
> = (props) => (
  <Field
    name={props.name || 'organization'}
    validate={props.validator}
    onChange={props.onChange}
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={props.placeholder || translate('Select organization...')}
        loadOptions={(query, prevOptions, { page }) =>
          organizationAutocomplete(query, prevOptions, page, {
            field: ['name', 'uuid', 'abbreviation'],
            o: 'name',
          })
        }
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
        inputId="organization-selector-input"
        {...props.reactSelectProps}
      />
    )}
  />
);
