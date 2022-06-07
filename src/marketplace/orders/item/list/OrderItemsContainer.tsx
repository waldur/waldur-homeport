import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useProviderItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

export const OrderItemsContainer: FunctionComponent = () => {
  useTitle(translate('Public orders'));
  useProviderItems();
  return (
    <OrderItemsList
      filters={
        <OrderItemsFilter
          showOrganizationFilter={true}
          showOfferingFilter={true}
        />
      }
    />
  );
};
