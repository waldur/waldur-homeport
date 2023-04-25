import { FunctionComponent } from 'react';

import { CustomersOrganizationGroupsChart } from '@waldur/customer/organization-groups/CustomersOrganizationGroupsChart';
import { CustomersOrganizationGroupsFilter } from '@waldur/customer/organization-groups/CustomersOrganizationGroupsFilter';

export const CustomersOrganizationGroupsContainer: FunctionComponent = () => {
  return (
    <>
      <CustomersOrganizationGroupsFilter />
      <CustomersOrganizationGroupsChart />
    </>
  );
};
