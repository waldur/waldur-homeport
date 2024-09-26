import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { QuotasTable } from '@waldur/quotas/QuotasTable';

export const TenantMainComponent = ({ resourceScope }) => {
  return resourceScope ? (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Quotas')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <QuotasTable resource={resourceScope} />
      </Card.Body>
    </Card>
  ) : null;
};
