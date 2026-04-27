import { debounce } from 'lodash';
import { FunctionComponent, useCallback, useMemo } from 'react';

import { AsyncPaginate } from '@/form/themed-select';
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
  debounceMs,
}) => {
  const debouncedAutocomplete = useMemo(
    () =>
      debounce(
        (
          query: string,
          prevOptions: any,
          page: number,
          options: any,
          resolve,
        ) => {
          organizationAutocomplete(query, prevOptions, page, options).then(
            resolve,
          );
        },
        debounceMs || 1000,
      ),
    [debounceMs],
  );

  const loadOptions = useCallback(
    (query: string, prevOptions: any, { page }: { page: number }) => {
      return new Promise((resolve) => {
        debouncedAutocomplete(
          query,
          prevOptions,
          page,
          {
            field: ['name', 'uuid', 'abbreviation'],
            o: 'name',
          },
          resolve,
        );
      });
    },
    [debouncedAutocomplete],
  );

  return (
    <AsyncPaginate
      placeholder={placeholder || translate('Select organization...')}
      loadOptions={loadOptions}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      value={input.value}
      onChange={(value) => input.onChange(value)}
      onBlur={input.onBlur}
      noOptionsMessage={() => noOptionsMessage || translate('No organizations')}
      isClearable={true}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
      {...reactSelectProps}
    />
  );
};
