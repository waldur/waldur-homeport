import * as React from 'react';

import { Panel } from '@waldur/core/Panel';

import { SupportResourcesFilter } from './SupportResourcesFilter';
import { SupportResourcesList } from './SupportResourcesList';

export const SupportResourcesContainer = () => (
  <Panel>
    <SupportResourcesFilter />
    <SupportResourcesList />
  </Panel>
);
