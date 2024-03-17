import { FunctionComponent } from 'react';

import { OrganizationsFilter } from './OrganizationsFilter';
import { SupportCustomerList } from './SupportCustomerList';

export const OrganizationsList: FunctionComponent = () => {
  return <SupportCustomerList filters={<OrganizationsFilter />} />;
};
