import { FunctionComponent } from 'react';

import { PlanUsageFilter } from './PlanUsageFilter';
import { PlanUsageList } from './PlanUsageList';

export const PlanUsageContainer: FunctionComponent = () => {
  return <PlanUsageList filters={<PlanUsageFilter />} />;
};
