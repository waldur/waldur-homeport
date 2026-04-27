import { FC, useMemo } from 'react';

import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { ProvisioningSummary } from './types';

interface ProvisioningSummaryCardsProps {
  summary: ProvisioningSummary;
}

export const ProvisioningSummaryCards: FC<ProvisioningSummaryCardsProps> = ({
  summary,
}) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Success rate'),
        value: `${summary.successRate}%`,
      },
      {
        label: translate('Total orders'),
        value: summary.totalOrders.toLocaleString(),
      },
      {
        label: translate('Successful orders'),
        value: summary.successfulOrders.toLocaleString(),
      },
      {
        label: translate('Failed orders'),
        value: summary.failedOrders.toLocaleString(),
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
