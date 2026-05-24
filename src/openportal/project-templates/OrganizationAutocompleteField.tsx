import { FunctionComponent, useMemo } from 'react';

import { AsyncSelect } from '@/form/select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

interface OrganizationAutocompleteProps extends FormField {
  placeholder?: string;
  validator?: any;
  noOptionsMessage?: string;
  reactSelectProps?: any;
  debounceMs?: number;
}

export const OrganizationAutocompleteField: FunctionComponent<
  OrganizationAutocompleteProps
> = ({
  input,
  placeholder,
  noOptionsMessage,
  reactSelectProps,
  debounceMs = 1000,
}) => {
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid', 'abbreviation'],
        o: 'name',
      }),
    [],
  );

  return (
    <AsyncSelect
      placeholder={placeholder || translate('Select organization...')}
      loadOptions={loadOrganizations}
      debounceTimeout={debounceMs}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      value={input.value}
      onChange={(value) => input.onChange(value)}
      onBlur={input.onBlur}
      noOptionsMessage={() => noOptionsMessage || translate('No organizations')}
      isClearable={true}
      {...reactSelectProps}
    />
  );
};
