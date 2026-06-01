import React from 'react';

import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { resourceOfferingsAutocomplete } from '@/marketplace/common/autocompletes';

export const OfferingFilter: React.FC<{
  category_uuid;
  name?;
}> = ({ category_uuid, name = 'offering' }) => {
  return (
    <AsyncSelectGroup
      name={name}
      label={translate('Offering')}
      placeholder={translate('Select offering...')}
      loadOptions={React.useMemo(
        () => resourceOfferingsAutocomplete(category_uuid),
        [category_uuid],
      )}
      getOptionLabel={({ name: _name }) => _name}
      getOptionValue={({ uuid }) => uuid}
      required={true}
      variant="tableFilter"
    />
  );
};
