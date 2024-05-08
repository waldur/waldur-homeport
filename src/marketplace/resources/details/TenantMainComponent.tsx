import { useContext, useEffect } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { PageBarContext } from '@waldur/marketplace/context';
import { QuotasTable } from '@waldur/quotas/QuotasTable';

export const TenantMainComponent = ({ scope, activeTab }) => {
  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    if (scope) {
      addTabs([
        {
          key: 'quotas',
          title: translate('Quotas'),
          priority: 12,
        },
      ]);
    }
  }, [scope]);

  return scope ? (
    <Card className={activeTab === 'quotas' ? 'mb-10' : 'd-none'} id="quotas">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Quotas')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <QuotasTable resource={scope} />
      </Card.Body>
    </Card>
  ) : null;
};
