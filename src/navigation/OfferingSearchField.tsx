import debounce from 'lodash/debounce';
import { FunctionComponent, useCallback, ChangeEvent, FocusEvent } from 'react';

import { translate } from '@waldur/i18n';
import { InputField } from '@waldur/marketplace/offerings/service-providers/shared/InputField';
import { MIN_QUERY_LENGTH } from '@waldur/navigation/constants';

interface OfferingSearchFieldProps {
  onSearch: (query: string) => void;
  onFocus: () => void;
}

export const OfferingSearchField: FunctionComponent<OfferingSearchFieldProps> =
  ({ onSearch, onFocus }) => {
    const debouncedOnChange = useCallback(
      debounce((query: string) => {
        onSearch(query);
      }, 500),
      [],
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.persist();
      const { value } = event.target;
      if (!value || value.length < MIN_QUERY_LENGTH) {
        return;
      }
      debouncedOnChange(value);
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      event.persist();
      const { value } = event.target;
      if (!value || value.length < MIN_QUERY_LENGTH) {
        return;
      }
      onFocus();
    };

    return (
      <InputField
        name="name"
        placeholder={translate('Search for offerings and providers')}
        onChange={handleChange}
        onFocus={handleFocus}
      />
    );
  };
