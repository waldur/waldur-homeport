import { Panel } from '@waldur/core/Panel';

import { FlowListFilter } from './FlowListFilter';
import { FlowsList } from './FlowsList';

export const FlowListContainer = () => (
  <Panel>
    <FlowListFilter />
    <FlowsList />
  </Panel>
);
