import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';

import { OfferingCustomerOrganizationsTable } from './OfferingCustomerOrganizationsTable';
import { OfferingCustomerProjectsTable } from './OfferingCustomerProjectsTable';
import { OfferingCustomerUsersTable } from './OfferingCustomerUsersTable';

interface OfferingCustomersProps {
  offering: Offering;
}

export const OfferingCustomers = ({ offering }: OfferingCustomersProps) => {
  const { params } = useCurrentStateAndParams();
  const activeTab = params.customerTab || 'organizations';

  const tabs = useMemo(
    () =>
      [
        {
          key: 'organizations',
          title: translate('Organizations'),
        },
        {
          key: 'projects',
          title: translate('Projects'),
        },
        {
          key: 'users',
          title: translate('Users'),
        },
      ].map((tab) => ({
        ...tab,
        state: 'marketplace-offering-details',
        params: {
          offering_uuid: offering.uuid,
          tab: 'customers',
          customerTab: tab.key,
        },
      })),
    [offering.uuid],
  );

  if (activeTab === 'projects') {
    return <OfferingCustomerProjectsTable offering={offering} tabs={tabs} />;
  }

  if (activeTab === 'users') {
    return <OfferingCustomerUsersTable offering={offering} tabs={tabs} />;
  }

  return <OfferingCustomerOrganizationsTable offering={offering} tabs={tabs} />;
};
