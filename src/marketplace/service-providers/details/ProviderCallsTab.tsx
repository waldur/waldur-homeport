import { Card } from 'react-bootstrap';

import { PublicCallsList } from '@waldur/proposals/PublicCallsList';

export const ProviderCallsTab = (props) => {
  return (
    <Card>
      <Card.Body>
        <PublicCallsList
          provider_uuid={props.provider_uuid}
          offering_uuid={null}
        />
      </Card.Body>
    </Card>
  );
};
