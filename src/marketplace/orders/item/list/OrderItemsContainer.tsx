import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useSidebarKey } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

export const OrderItemsContainer: FunctionComponent = () => {
  useTitle(translate('Public orders'));
  useSidebarKey('public-order-items');
  return (
    <Card.Body>
      <OrderItemsFilter
        showOrganizationFilter={true}
        showOfferingFilter={true}
      />
      <OrderItemsList />
    </Card.Body>
  );
};
