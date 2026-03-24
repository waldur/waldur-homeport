import { FC, useMemo } from 'react';

import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';

import { GrowthStats } from './types';

interface GrowthSummaryCardsProps {
  stats: GrowthStats;
  year: number;
}

export const GrowthSummaryCards: FC<GrowthSummaryCardsProps> = ({
  stats,
  year,
}) => {
  const summary = useMemo(
    () => [
      {
        label: translate('Total usage ({year})', { year }),
        value: stats.totalUsage.toLocaleString(),
      },
      {
        label: translate('Year-over-year'),
        value: `${stats.yearOverYearGrowth >= 0 ? '+' : ''}${stats.yearOverYearGrowth.toFixed(1)}%`,
      },
      {
        label: translate('Month-over-month'),
        value: `${stats.monthOverMonthGrowth >= 0 ? '+' : ''}${stats.monthOverMonthGrowth.toFixed(1)}%`,
      },
      {
        label: translate('Peak month'),
        value: renderFieldOrDash(stats.peakMonth),
      },
    ],
    [stats, year],
  );

  return <SummaryWidget stats={summary} />;
};
