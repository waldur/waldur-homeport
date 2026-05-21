import React from 'react';

import { AsyncSelectField } from '@/form/AsyncSelectField';
import { REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { resourceOfferingsAutocomplete } from '@/marketplace/common/autocompletes';

export const OfferingFilter: React.FC<{
  category_uuid;
  name?;
}> = ({ category_uuid, name = 'offering' }) => {
  return (
    <AsyncSelectField
      name={name}
      label={translate('Offering')}
      placeholder={translate('Select offering...')}
      loadOptions={(query, prevOptions, page) =>
        resourceOfferingsAutocomplete(
          { name: query },
          prevOptions,
          page,
          category_uuid,
        )
      }
      getOptionLabel={({ name: _name }) => _name}
      getOptionValue={({ uuid }) => uuid}
      required={true}
      {...REACT_SELECT_TABLE_FILTER}
    />
  );
};
