import { Card } from 'react-bootstrap';

import { MarketplaceOrdersList } from '@waldur/marketplace/orders/list/MarketplaceOrdersList';

export const ProviderOrdersTab = (props) => {
  return (
    <Card>
      <Card.Body>
        <MarketplaceOrdersList provider_uuid={props.provider_uuid} />
      </Card.Body>
    </Card>
  );
};
