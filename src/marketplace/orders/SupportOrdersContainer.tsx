import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { SupportOrdersList } from '@waldur/marketplace/orders/item/list/SupportOrdersList';
import { SupportOrdersListFilter } from '@waldur/marketplace/orders/item/list/SupportOrdersListFilter';
import { useAdminItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

export const SupportOrdersContainer: FunctionComponent = () => {
  useTitle(translate('Orders'));
  useAdminItems();
  return <SupportOrdersList filters={<SupportOrdersListFilter />} />;
};
