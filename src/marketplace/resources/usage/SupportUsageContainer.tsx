import { FunctionComponent } from 'react';

import { SupportUsageFilter } from './SupportUsageFilter';
import { SupportUsageList } from './SupportUsageList';

export const SupportUsageContainer: FunctionComponent = () => {
  return <SupportUsageList filters={<SupportUsageFilter />} />;
};
