import { FC, useMemo } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { UsageByCustomerSummary } from './types';

interface Props {
  summary: UsageByCustomerSummary;
}

export const UsageByCustomerSummaryCards: FC<Props> = ({ summary }) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Organizations'),
        value: summary.totalCustomers.toLocaleString(),
      },
      {
        label: translate('Total resources'),
        value: summary.totalResources.toLocaleString(),
      },
      {
        label: translate('Total cost'),
        value: defaultCurrency(summary.totalCost),
      },
      {
        label: translate('With errors'),
        value: summary.customersWithErrors.toLocaleString(),
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
