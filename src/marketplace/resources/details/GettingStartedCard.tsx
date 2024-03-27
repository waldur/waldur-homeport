import { Card } from 'react-bootstrap';

import { CodePreview } from '@waldur/core/CodePreview';
import { translate } from '@waldur/i18n';

export const GettingStartedCard = ({ resource, offering }) => {
  return offering.getting_started ? (
    <Card className="mb-7" id="getting-started">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Getting started')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <CodePreview
          template={offering.getting_started}
          context={{
            backend_id: resource.effective_id || resource.backend_id,
            resource_name: resource.name,
            resource_username: resource.username || 'username',
          }}
        />
      </Card.Body>
    </Card>
  ) : null;
};
