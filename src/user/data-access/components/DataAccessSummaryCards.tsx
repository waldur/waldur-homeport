import { FC, useMemo } from 'react';

import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';

import { DataAccessSummary } from '../types';

interface DataAccessSummaryCardsProps {
  summary: DataAccessSummary;
}

export const DataAccessSummaryCards: FC<DataAccessSummaryCardsProps> = ({
  summary,
}) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Administrative access'),
        value: renderFieldOrDash(summary.total_administrative_access),
      },
      {
        label: translate('Organizational access'),
        value: renderFieldOrDash(summary.total_organizational_access),
      },
      {
        label: translate('Service provider access'),
        value: renderFieldOrDash(summary.total_provider_access),
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
