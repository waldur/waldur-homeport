import { Card, CardContent } from 'waldur-ui';

import { translate } from '@/i18n';

import { BillingSyncButton } from '../billing/BillingSyncButton';

export const TriggerConsumptionSyncAction = () => (
  <Card className="h-full">
    <CardContent>
      <h6>{translate('Sync consumption')}</h6>
      <p className="text-quaternary small mb-2.5">
        {translate(
          'Fetch consumption from Arrow for a month and preview what it changes on invoices before applying it.',
        )}
      </p>
      <BillingSyncButton
        action="sync_consumption"
        label={translate('Sync consumption')}
      />
    </CardContent>
  </Card>
);
