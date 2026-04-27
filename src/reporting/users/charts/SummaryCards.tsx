import { FC, useMemo } from 'react';

import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { UserStatisticsSummary } from '../types';

interface SummaryCardsProps {
  summary: UserStatisticsSummary;
}

export const SummaryCards: FC<SummaryCardsProps> = ({ summary }) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Total users'),
        value: summary.totalUsers.toLocaleString(),
      },
      {
        label: translate('Active users'),
        value: `${summary.activePercent}%`,
      },
      {
        label: translate('Federated users'),
        value: `${summary.federatedPercent}%`,
      },
      {
        label: translate('Identity sources'),
        value: summary.identitySourceCount,
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
