import { FunctionComponent, useMemo } from 'react';
import { NestedColumn } from 'waldur-js-client';

import { translate } from '@/i18n';
import { resourceOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { parentOfferingFilter } from '@/marketplace/offerings/utils';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { StringFilter, BooleanFilter, AsyncSelectFilter } from '@/table';

import { ProjectFilter } from './ProjectFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';

export const AllResourcesFilter: FunctionComponent<{
  category_uuid?: string;
  columns?: NestedColumn[];
}> = ({ category_uuid, columns }) => {
  const loadOptions = useMemo(
    () => resourceOfferingsAutocomplete(category_uuid),
    [category_uuid],
  );
  return (
    <>
      <OrganizationFilter />
      <ProjectFilter />
      <AsyncSelectFilter
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
        placeholder={translate('Select offering...')}
        loadOptions={loadOptions}
        getOptionLabel={(value) => value?.name}
        getOptionValue={(value) => value?.uuid}
        required={true}
      />
      <OfferingFilter
        title={translate('Parent offering')}
        name="parent_offering"
        badgeValue={(value) => value?.name}
        offeringFilter={parentOfferingFilter}
      />
      <RuntimeStateFilter />
      {columns?.some((column) => column.attribute === 'flavor_name') && (
        <StringFilter
          title={translate('Flavor name')}
          name="flavor_name"
          placeholder={translate('Flavor name...')}
        />
      )}
      {columns?.some((column) => column.attribute === 'image_name') && (
        <StringFilter
          title={translate('Image name')}
          name="image_name"
          placeholder={translate('Image name...')}
        />
      )}
      <ResourceStateFilter instantApply={false} />
      <BooleanFilter
        title={translate('Include terminated')}
        name="include_terminated"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        ellipsis={false}
      />
      <BooleanFilter
        title={translate('Exclude attached')}
        name="exclude_attached"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        ellipsis={false}
      />
      <BooleanFilter
        title={translate('Paused')}
        name="paused"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        ellipsis={false}
      />
      <BooleanFilter
        title={translate('Downscaled')}
        name="downscaled"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        ellipsis={false}
      />
      <BooleanFilter
        title={translate('Restrict member access')}
        name="restrict_member_access"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        ellipsis={false}
      />
    </>
  );
};
