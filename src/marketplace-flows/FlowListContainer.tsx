import { useUserTabs } from '@waldur/user/constants';

import { FlowListFilter } from './FlowListFilter';
import { FlowsList } from './FlowsList';

export const FlowListContainer = () => {
  useUserTabs();
  return <FlowsList filters={<FlowListFilter />} />;
};
