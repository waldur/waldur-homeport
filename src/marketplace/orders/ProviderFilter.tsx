import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';
import { AsyncSelectFilter } from '@/table';

interface ProviderFilterProps {
  [key: string]: any;
}

export const ProviderFilter: FC<ProviderFilterProps> = ({
  name = 'provider',
  ...props
}) => {
  const loadOptions = useMemo(() => providerAutocomplete, []);

  return (
    <AsyncSelectFilter
      title={translate('Service provider')}
      name={name}
      badgeValue={(value) => value?.customer_name || value?.name}
      getValueLabel={(value) => value?.customer_name || value?.name}
      placeholder={translate('Select service provider...')}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.customer_uuid}
      getOptionLabel={(option) => option.customer_name}
      {...props}
    />
  );
};
