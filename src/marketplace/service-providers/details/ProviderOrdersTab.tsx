import { Card } from 'react-bootstrap';

import { ProviderOrdersList } from '../ProviderOrdersList';

export const ProviderOrdersTab = (props) => {
  return (
    <Card>
      <Card.Body>
        <ProviderOrdersList provider={props.provider} />
      </Card.Body>
    </Card>
  );
};
