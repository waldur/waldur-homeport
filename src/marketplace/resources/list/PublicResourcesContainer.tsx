import { FunctionComponent } from 'react';

import { PublicResourcesFilter } from './PublicResourcesFilter';
import { PublicResourcesList } from './PublicResourcesList';

export const PublicResourcesContainer: FunctionComponent = () => {
  return <PublicResourcesList filters={<PublicResourcesFilter />} />;
};
