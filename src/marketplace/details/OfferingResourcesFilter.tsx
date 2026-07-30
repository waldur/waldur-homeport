import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { TABLE_OFFERING_RESOURCE } from '@/marketplace/details/constants';
import { ResourceStateFilter } from '@/marketplace/resources/list/ResourceStateFilter';
import { RuntimeStateFilter } from '@/marketplace/resources/list/RuntimeStateFilter';
import { BooleanFilter } from '@/table';
import { ProviderOfferingResourcesFilter } from '@/table/generated/ProviderOfferingResourcesFilter';
import { useFilterValues } from '@/table/useFilterValues';

interface OfferingResourcesFilterProps {
  offeringUuid: string;
}

export const OfferingResourcesFilter: FunctionComponent<
  OfferingResourcesFilterProps
> = ({ offeringUuid }) => {
  const values = useFilterValues(TABLE_OFFERING_RESOURCE);

  return (
    <>
      <ProviderOfferingResourcesFilter
        offeringUuid={offeringUuid}
        organizationUuid={values?.organization?.uuid}
      />
      <RuntimeStateFilter offeringUuid={offeringUuid} />
      <ResourceStateFilter ellipsis={false} instantApply={false} />
      <BooleanFilter
        title={translate('Include terminated')}
        name="include_terminated"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        label={translate('Include terminated')}
      />
    </>
  );
};
