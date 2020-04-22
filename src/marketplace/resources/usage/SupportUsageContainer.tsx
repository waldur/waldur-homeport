import * as React from 'react';

import { Panel } from '@waldur/core/Panel';

import { SupportUsageFilter } from './SupportUsageFilter';
import { SupportUsageList } from './SupportUsageList';

export const SupportUsageContainer = () => (
  <Panel>
    <SupportUsageFilter />
    <SupportUsageList />
  </Panel>
);
