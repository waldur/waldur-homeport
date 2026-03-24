import { FC, useMemo } from 'react';

import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';

interface SummaryData {
  totalInstances: number;
  activeInstances: number;
  totalCores: number;
  totalRamMb: number;
  totalDiskMb: number;
}

interface OpenstackInstancesSummaryCardsProps {
  summary: SummaryData;
}

export const OpenstackInstancesSummaryCards: FC<
  OpenstackInstancesSummaryCardsProps
> = ({ summary }) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Total instances'),
        value: renderFieldOrDash(summary.totalInstances),
      },
      {
        label: translate('Active instances'),
        value: renderFieldOrDash(summary.activeInstances),
      },
      {
        label: translate('Total vCPUs'),
        value: renderFieldOrDash(summary.totalCores),
      },
      {
        label: translate('Total RAM'),
        value: renderFieldOrDash(formatFilesize(summary.totalRamMb)),
      },
      {
        label: translate('Total disk'),
        value: renderFieldOrDash(formatFilesize(summary.totalDiskMb)),
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
