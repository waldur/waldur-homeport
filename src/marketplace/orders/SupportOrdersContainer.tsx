import { FunctionComponent } from 'react';

import { SupportOrdersList } from '@waldur/marketplace/orders/item/list/SupportOrdersList';
import { SupportOrdersListFilter } from '@waldur/marketplace/orders/item/list/SupportOrdersListFilter';

export const SupportOrdersContainer: FunctionComponent = () => {
  return <SupportOrdersList filters={<SupportOrdersListFilter />} />;
};
