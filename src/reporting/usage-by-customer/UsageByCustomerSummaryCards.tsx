import { FC, useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';

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
