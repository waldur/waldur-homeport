import React from 'react';

import { translate } from '@/i18n';
import { tagAutocomplete } from '@/marketplace/common/autocompletes';
import { AsyncSelectFilter } from '@/table';

export const TagFilter: React.FC<any> = (props) => {
  return (
    <AsyncSelectFilter
      title={translate('Tag')}
      name="tag"
      badgeValue={(value) => value?.name}
      placeholder={translate('Select tag...')}
      loadOptions={tagAutocomplete}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      {...props}
    />
  );
};
