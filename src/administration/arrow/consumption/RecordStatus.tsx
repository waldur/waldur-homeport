import type { ArrowConsumptionRecord } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

const monthHasEnded = (billingPeriod: string) => {
  const start = new Date(`${billingPeriod}T00:00:00`);
  const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return nextMonth <= new Date();
};

export const RecordStatus = ({ row }: { row: ArrowConsumptionRecord }) => {
  if (row.is_finalized) {
    return (
      <Badge variant="success" shape="pill" tone="outline">
        {translate('Settled')}
      </Badge>
    );
  }
  return monthHasEnded(row.billing_period) ? (
    <Badge variant="warning" shape="pill" tone="outline">
      {translate('Awaiting final billing')}
    </Badge>
  ) : (
    <Badge variant="neutral" shape="pill" tone="outline">
      {translate('Estimate')}
    </Badge>
  );
};
