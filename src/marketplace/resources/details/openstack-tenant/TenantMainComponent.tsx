import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { QuotasTable } from '@waldur/quotas/QuotasTable';

import { TenantDetails } from './TenantDetails';

export const TenantMainComponent = ({ resource, scope }) =>
  scope ? (
    <>
      <Card className="mb-10">
        <Card.Header>
          <Card.Title>
            <h3>{translate('Cloud components')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <TenantDetails resource={resource} />
        </Card.Body>
      </Card>
      <Card className="mb-10">
        <Card.Header>
          <Card.Title>
            <h3>{translate('Quotas')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <QuotasTable resource={scope} />
        </Card.Body>
      </Card>
    </>
  ) : null;
