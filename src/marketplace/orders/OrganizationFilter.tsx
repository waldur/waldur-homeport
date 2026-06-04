import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { AsyncSelectFilter } from '@/table';

interface OrganizationFilterProps {
  [key: string]: any;
}

export const OrganizationFilter: FC<OrganizationFilterProps> = (props) => {
  const loadOptions = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid', 'abbreviation'],
        o: 'name',
      }),
    [],
  );

  return (
    <AsyncSelectFilter
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
      placeholder={translate('Select organization...')}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      {...props}
    />
  );
};
