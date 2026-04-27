import { FC, useMemo } from 'react';

import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { UsageByOrgTypeSummary } from './types';

interface Props {
  summary: UsageByOrgTypeSummary;
}

export const UsageByOrgTypeSummaryCards: FC<Props> = ({ summary }) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Organization types'),
        value: summary.totalOrgTypes.toLocaleString(),
      },
      {
        label: translate('Total resources'),
        value: summary.totalResources.toLocaleString(),
      },
      {
        label: translate('Total usage'),
        value: summary.totalUsage.toLocaleString(),
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
