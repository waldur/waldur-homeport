import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ResourceDetailsPage } from '@waldur/marketplace/resources/ResourceDetailsPage';
import { useSidebarKey } from '@waldur/navigation/context';
import { getCustomer } from '@waldur/workspace/selectors';

export const ResourceDetailsPageForServiceProvider: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  useSidebarKey('public-resources');
  return <ResourceDetailsPage customer={customer} />;
};
