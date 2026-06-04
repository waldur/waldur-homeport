import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { formatResourceShort } from '@/marketplace/utils';
import { AsyncSelectFilter } from '@/table';

export const ResourceFilter: FC<any> = (props) => {
  const loadOptions = useMemo(
    () =>
      resourceAutocomplete({
        field: ['name', 'url', 'uuid', 'offering_name'],
      }),
    [],
  );

  return (
    <AsyncSelectFilter
      title={translate('Resource')}
      name="resource"
      badgeValue={(value) => value?.name}
      placeholder={translate('Select resource...')}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => formatResourceShort(option)}
      {...props}
    />
  );
};
