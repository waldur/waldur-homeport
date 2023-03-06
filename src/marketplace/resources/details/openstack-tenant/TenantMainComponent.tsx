import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { TenantDetails } from './TenantDetails';

export const TenantMainComponent = ({ resource }) =>
  resource.scope ? (
    <div className="mb-10">
      <Card>
        <Card.Header>
          <Card.Title>
            <h3>{translate('Cloud components')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <TenantDetails resource={resource} />
        </Card.Body>
      </Card>
    </div>
  ) : null;
