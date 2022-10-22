import { FunctionComponent } from 'react';

import { SupportResourcesFilter } from './SupportResourcesFilter';
import { SupportResourcesList } from './SupportResourcesList';

export const SupportResourcesContainer: FunctionComponent = () => {
  return <SupportResourcesList filters={<SupportResourcesFilter />} />;
};
