import { FunctionComponent, useMemo } from 'react';

import { AsyncSelect } from '@/form/select';
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
  const loadOfferings = useMemo(() => providerOfferingsAutocomplete(), []);

  return (
    <AsyncSelect
      placeholder={placeholder || translate('Select offering...')}
      loadOptions={loadOfferings}
      debounceTimeout={debounceMs}
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
      {...reactSelectProps}
    />
  );
};
