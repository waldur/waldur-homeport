import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { useProviderItems } from '@waldur/navigation/navitems';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

export const OrderItemsContainer: FunctionComponent = () => {
  useTitle(translate('Public orders'));
  useProviderItems();
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
