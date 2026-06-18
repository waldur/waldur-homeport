import { FunctionComponent, useMemo } from 'react';

import { translate } from '@/i18n';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { parentOfferingFilter } from '@/marketplace/offerings/utils';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { BooleanFilter } from '@/table';
import { useCustomer, useUser } from '@/workspace/hooks';
import {
  checkIsOwnerOrStaff,
  checkIsServiceManager,
} from '@/workspace/selectors';

import { CategoryFilter } from './CategoryFilter';
import { ResourceStateFilter } from './ResourceStateFilter';

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
      <OfferingFilter offeringFilter={offeringFilter} />
      <OfferingFilter
        title={translate('Parent offering')}
        name="parent_offering"
        offeringFilter={parentOfferingFilter}
      />
      <OrganizationFilter title={translate('Client organization')} />
      <CategoryFilter />
      <ResourceStateFilter instantApply={false} />
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
