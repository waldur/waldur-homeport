import { FC, useMemo } from 'react';

import { StatCardGrid } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { UsageByAffiliationSummary } from './types';

interface Props {
  summary: UsageByAffiliationSummary;
}

export const AffiliationUsageSummaryCards: FC<Props> = ({ summary }) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Affiliations'),
        value: summary.totalAffiliations.toLocaleString(),
      },
      {
        label: translate('Total resources'),
        value: summary.totalResources.toLocaleString(),
      },
      {
        label: translate('Total cost'),
        value: defaultCurrency(summary.totalCost),
      },
    ],
    [summary],
  );

  return <StatCardGrid stats={stats} />;
};
