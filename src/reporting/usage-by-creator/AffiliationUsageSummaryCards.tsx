import { FC, useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';

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

  return <SummaryWidget stats={stats} />;
};
