import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { SupportOrdersList } from '@waldur/marketplace/orders/item/list/SupportOrdersList';
import { SupportOrdersListFilter } from '@waldur/marketplace/orders/item/list/SupportOrdersListFilter';
import { useTitle } from '@waldur/navigation/title';

export const SupportOrdersContainer: FunctionComponent = () => {
  useTitle(translate('Orders'));
  return <SupportOrdersList filters={<SupportOrdersListFilter />} />;
};
