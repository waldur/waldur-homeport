import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface OrganizationAutocompleteProps {
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  isServiceProvider?: boolean;
}

export const OrganizationAutocomplete: FunctionComponent<OrganizationAutocompleteProps> =
  (props) => (
    <Field
      name="organization"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={props.placeholder || translate('Select organization...')}
          loadOptions={(query, prevOptions, { page }) =>
            organizationAutocomplete(query, prevOptions, page, {
              field: ['name', 'uuid'],
              o: 'name',
              is_service_provider: props.isServiceProvider,
              has_resources: props.isServiceProvider ? undefined : true,
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
          additional={{
            page: 1,
          }}
        />
      )}
    />
  );
