import { FunctionComponent } from 'react';

import { ResourceUsageFilter } from './ResourceUsageFilter';
import { ResourceUsageList } from './ResourceUsageList';

export const ResourceUsageContainer: FunctionComponent = () => {
  return <ResourceUsageList filters={<ResourceUsageFilter />} />;
};
