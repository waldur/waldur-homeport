import { debounce } from 'lodash';
import { FunctionComponent, useCallback, useMemo } from 'react';

import { AsyncPaginate } from '@/form/themed-select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';

interface OfferingAutocompleteProps extends FormField {
  placeholder?: string;
  validator?: any;
  noOptionsMessage?: string;
  reactSelectProps?: any;
  isMulti?: boolean;
  debounceMs?: number;
}

export const OfferingAutocompleteField: FunctionComponent<
  OfferingAutocompleteProps
> = ({
  input,
  placeholder,
  noOptionsMessage,
  reactSelectProps,
  isMulti,
  debounceMs = 1000,
}) => {
  const debouncedAutocomplete = useMemo(
    () =>
      debounce(
        (query: string, prevOptions: any, currentPage: number, resolve) => {
          providerOfferingsAutocomplete(query, prevOptions, currentPage).then(
            resolve,
          );
        },
        debounceMs,
      ),
    [debounceMs],
  );

  const loadOptions = useCallback(
    (
      query: string,
      prevOptions: any,
      { currentPage }: { currentPage: number },
    ) => {
      return new Promise((resolve) => {
        debouncedAutocomplete(query, prevOptions, currentPage, resolve);
      });
    },
    [debouncedAutocomplete],
  );

  return (
    <AsyncPaginate
      placeholder={placeholder || translate('Select offering...')}
      loadOptions={loadOptions}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      value={isMulti ? input.value || [] : input.value}
      onChange={(value) => input.onChange(isMulti ? value || [] : value)}
      onBlur={input.onBlur}
      noOptionsMessage={() =>
        noOptionsMessage || translate('No public offerings')
      }
      isClearable={true}
      isMulti={isMulti}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
      {...reactSelectProps}
    />
  );
};
