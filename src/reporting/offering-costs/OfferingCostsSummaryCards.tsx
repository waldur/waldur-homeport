import { FC, useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';

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
