import { Panel } from '@waldur/core/Panel';
import { useUserTabs } from '@waldur/user/constants';

import { FlowListFilter } from './FlowListFilter';
import { FlowsList } from './FlowsList';

export const FlowListContainer = () => {
  useUserTabs();
  return (
    <Panel>
      <FlowsList filters={<FlowListFilter />} />
    </Panel>
  );
};
