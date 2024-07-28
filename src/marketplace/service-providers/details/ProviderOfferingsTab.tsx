import { Card } from 'react-bootstrap';

import { ProviderOfferingsList } from './ProviderDashboardTab';

export const ProviderOfferingsTab = (props) => {
  return (
    <Card>
      <Card.Body>
        <ProviderOfferingsList items={props.offerings} initialMode="table" />
      </Card.Body>
    </Card>
  );
};
