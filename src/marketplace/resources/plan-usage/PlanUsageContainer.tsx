import * as React from 'react';

import { Panel } from '@waldur/core/Panel';

import { PlanUsageFilter } from './PlanUsageFilter';
import { PlanUsageList } from './PlanUsageList';

export const PlanUsageContainer = () => (
  <Panel>
    <PlanUsageFilter />
    <PlanUsageList />
  </Panel>
);
