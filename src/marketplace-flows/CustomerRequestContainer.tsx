import { CustomerCreateRequestsList } from './CustomerCreateRequestsList';
import { FlowListFilter } from './FlowListFilter';

export const CustomerRequestContainer = () => {
  return <CustomerCreateRequestsList filters={<FlowListFilter />} />;
};
