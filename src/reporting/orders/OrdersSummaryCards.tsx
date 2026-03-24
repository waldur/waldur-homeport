import { FC, useMemo } from 'react';
import { OrderStatsSummary } from 'waldur-js-client';

import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';

interface OrdersSummaryCardsProps {
  stats: OrderStatsSummary;
}

export const OrdersSummaryCards: FC<OrdersSummaryCardsProps> = ({ stats }) => {
  const summary = useMemo(
    () => [
      {
        label: translate('Total orders'),
        value: stats.total,
      },
      {
        label: translate('Pending'),
        value: stats.pending,
      },
      {
        label: translate('Executing'),
        value: stats.executing,
      },
      {
        label: translate('Completed'),
        value: stats.done,
      },
      {
        label: translate('Rejected/Canceled'),
        value: stats.rejected + stats.canceled,
      },
    ],
    [stats],
  );

  return <SummaryWidget stats={summary} />;
};
