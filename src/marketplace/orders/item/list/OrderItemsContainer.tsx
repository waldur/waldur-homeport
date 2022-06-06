import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useProviderItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

export const OrderItemsContainer: FunctionComponent = () => {
  useTitle(translate('Public orders'));
  useProviderItems();
  return (
    <Card.Body>
      <OrderItemsList
        filters={
          <OrderItemsFilter
            showOrganizationFilter={true}
            showOfferingFilter={true}
          />
        }
      />
    </Card.Body>
  );
};
