import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface OrganizationAutocompleteProps {
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  reactSelectProps?: Partial<SelectProps>;
}

export const OrganizationAutocomplete: FunctionComponent<
  OrganizationAutocompleteProps
> = (props) => (
  <Field
    name="organization"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={props.placeholder || translate('Select organization...')}
        loadOptions={(query, prevOptions, { page }) =>
          organizationAutocomplete(query, prevOptions, page, {
            field: ['name', 'uuid'],
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
        {...props.reactSelectProps}
      />
    )}
  />
);
