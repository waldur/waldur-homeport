import { FunctionComponent } from 'react';

import { SupportOrdersList } from '@waldur/marketplace/orders/list/SupportOrdersList';
import { SupportOrdersListFilter } from '@waldur/marketplace/orders/list/SupportOrdersListFilter';

export const SupportOrdersContainer: FunctionComponent = () => {
  return <SupportOrdersList filters={<SupportOrdersListFilter />} />;
};
