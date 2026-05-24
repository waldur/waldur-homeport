import { FunctionComponent, useMemo } from 'react';
import { openportalUnmanagedProjectsList } from 'waldur-js-client';

import { createLoadOptions, AsyncSelect } from '@/form/select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';

interface ProjectAutocompleteProps extends FormField {
  placeholder?: string;
  validator?: any;
  query?: Record<string, any>;
  noOptionsMessage?: string;
  reactSelectProps?: any;
  debounceMs?: number;
}

// Main component with improvements
export const ProjectAutocompleteField: FunctionComponent<
  ProjectAutocompleteProps
> = ({
  input,
  placeholder,
  query = {}, // Provide default empty object
  noOptionsMessage,
  reactSelectProps = {}, // Provide default empty object
  debounceMs = 300, // Reduced default debounce time for better UX
}) => {
  const loadOptions = useMemo(
    () =>
      createLoadOptions(openportalUnmanagedProjectsList, 'query', {
        field: ['name', 'uuid'],
        o: ['name'],
        ...query,
      }),
    [query],
  );

  return (
    <AsyncSelect
      placeholder={placeholder || translate('Select project...')}
      loadOptions={loadOptions}
      debounceTimeout={debounceMs}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      value={input.value}
      onChange={input.onChange}
      onBlur={input.onBlur}
      noOptionsMessage={() =>
        noOptionsMessage || translate('No projects found')
      }
      isClearable={true}
      {...reactSelectProps}
    />
  );
};
