import { FunctionComponent } from 'react';

import { ResourceDetailsPage } from '@waldur/marketplace/resources/ResourceDetailsPage';
import { useSidebarKey } from '@waldur/navigation/context';

export const ResourceDetailsPageForServiceProvider: FunctionComponent = () => {
  useSidebarKey('public-resources');
  return <ResourceDetailsPage />;
};
