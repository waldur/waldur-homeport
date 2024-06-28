import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { KeyValueTable } from '@waldur/marketplace/resources/KeyValueTable';

export const UserSubmittedFieldsTab = ({ order }) => {
  return (
    <Card>
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('User submitted fields')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <KeyValueTable items={order.attributes} />
      </Card.Body>
    </Card>
  );
};
