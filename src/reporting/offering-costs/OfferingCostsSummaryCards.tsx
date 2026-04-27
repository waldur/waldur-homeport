import { FC, useMemo } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { OfferingCostsSummary } from './types';

interface OfferingCostsSummaryCardsProps {
  summary: OfferingCostsSummary;
}

export const OfferingCostsSummaryCards: FC<OfferingCostsSummaryCardsProps> = ({
  summary,
}) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Total cost'),
        value: defaultCurrency(summary.totalCost) ?? '',
      },
      {
        label: translate('Offerings'),
        value: summary.offeringCount,
      },
      {
        label: translate('Average cost'),
        value: defaultCurrency(summary.averageCost) ?? '',
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
