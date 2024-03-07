import { FunctionComponent } from 'react';

import { OrganizationGroupsChart } from './OrganizationGroupsChart';
import { OrganizationGroupsFilter } from './OrganizationGroupsFilter';

export const OrganizationGroupsContainer: FunctionComponent = () => {
  return (
    <>
      <OrganizationGroupsFilter />
      <OrganizationGroupsChart />
    </>
  );
};
