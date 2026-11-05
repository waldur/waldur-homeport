import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { translate } from '@/i18n';
import { QuotasTable } from '@/quotas/QuotasTable';

export const TenantMainComponent = ({ resourceScope }) => {
  return resourceScope ? (
    <Card bordered>
      <CardHeader>
        <CardTitle as="div">
          <h3>{translate('Quotas')}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <QuotasTable resource={resourceScope} />
      </CardContent>
    </Card>
  ) : null;
};
