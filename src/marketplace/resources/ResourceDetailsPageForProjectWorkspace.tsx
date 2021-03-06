import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ResourceDetailsPage } from '@waldur/marketplace/resources/ResourceDetailsPage';
import { getCustomer } from '@waldur/workspace/selectors';

export const ResourceDetailsPageForProjectWorkspace: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  return <ResourceDetailsPage customer={customer} />;
};
