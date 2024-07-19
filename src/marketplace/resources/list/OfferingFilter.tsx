import React from 'react';

import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { resourceOfferingsAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const OfferingFilter: React.FC<{ category_uuid }> = ({
  category_uuid,
}) => (
  <AsyncSelectField
    name="offering"
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
    getOptionLabel={({ name }) => name}
    getOptionValue={({ url }) => url}
    required={true}
    {...REACT_SELECT_TABLE_FILTER}
  />
);
