import { FunctionComponent, useMemo } from 'react';

import { translate } from '@/i18n';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { parentOfferingFilter } from '@/marketplace/offerings/utils';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { BooleanFilter } from '@/table';
import { facetOption } from '@/table/facets';
import { useCustomer, useUser } from '@/workspace/hooks';
import {
  checkIsOwnerOrStaff,
  checkIsServiceManager,
} from '@/workspace/selectors';

import { CategoryFilter } from './CategoryFilter';
import { ResourceStateFilter } from './ResourceStateFilter';

const byName = facetOption('uuid', 'name');
const byTitle = facetOption('uuid', 'title');

export const ProviderResourcesFilter: FunctionComponent = () => {
  const customer = useCustomer();
  const user = useUser();

  const offeringFilter = useMemo(() => {
    const isServiceManager = checkIsServiceManager(customer, user);
    const isOwnerOrStaff = checkIsOwnerOrStaff(customer, user);
    return isServiceManager && !isOwnerOrStaff
      ? { customer_uuid: customer?.uuid, service_manager_uuid: user?.uuid }
      : {
          customer_uuid: customer?.uuid,
        };
  }, [customer, user]);

  return (
    <>
      <OfferingFilter offeringFilter={offeringFilter} facet="offering" />
      <OfferingFilter
        title={translate('Parent offering')}
        name="parent_offering"
        offeringFilter={parentOfferingFilter}
        facet="parent_offering"
      />
      <OrganizationFilter
        title={translate('Client organization')}
        facet="customer"
        facetOption={byName}
      />
      <CategoryFilter facet="category" facetOption={byTitle} />
      <ResourceStateFilter instantApply={false} facet="state" />
      <BooleanFilter
        title={translate('Include terminated')}
        name="include_terminated"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        label={translate('Include terminated')}
      />
      <BooleanFilter
        title={translate('Paused')}
        name="paused"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        label={translate('Paused')}
      />
      <BooleanFilter
        title={translate('Downscaled')}
        name="downscaled"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        label={translate('Downscaled')}
      />
      <BooleanFilter
        title={translate('Restrict member access')}
        name="restrict_member_access"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        label={translate('Restrict member access')}
      />
    </>
  );
};
