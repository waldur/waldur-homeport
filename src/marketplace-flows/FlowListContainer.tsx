import { FlowListFilter } from './FlowListFilter';
import { FlowsList } from './FlowsList';

export const FlowListContainer = () => {
  return <FlowsList filters={<FlowListFilter />} />;
};
