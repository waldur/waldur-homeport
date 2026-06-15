import { FC } from 'react';

import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { OfferingTypeFilter } from '@/marketplace/offerings/details/OfferingTypeFilter';
import { AsyncSelectFilter, StringFilter } from '@/table';
import { useFilterValues } from '@/table/useFilterValues';

export const COMPONENT_USAGE_FILTER_FORM_ID = 'OfferingComponentUsageFilter';

export const OfferingComponentUsageFilter: FC = () => {
  const values = useFilterValues('OfferingComponentUsage');
  const provider = values?.provider;

  return (
    <>
      <AsyncSelectFilter
        title={translate('Service provider')}
        name="provider"
        badgeValue={(value) => value?.customer_name}
        placeholder={translate('Select service provider...')}
        loadOptions={providerAutocomplete}
        getOptionLabel={({ customer_name }) => customer_name}
        getOptionValue={({ customer_uuid }) => customer_uuid}
      />
      <OfferingFilter
        badgeValue={(value) => value?.name}
        name="offering"
        offeringFilter={
          provider ? { customer_uuid: provider.customer_uuid } : {}
        }
      />
      <OfferingTypeFilter />
      <StringFilter
        title={translate('Component type')}
        name="component_type"
        placeholder={translate('Enter component type...')}
      />
    </>
  );
};
