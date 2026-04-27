import { FC, useMemo } from 'react';

import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { ClassificationSummary } from './types';

interface ClassificationSummaryCardsProps {
  summary: ClassificationSummary;
}

export const ClassificationSummaryCards: FC<
  ClassificationSummaryCardsProps
> = ({ summary }) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Total projects'),
        value: summary.totalProjects,
      },
      {
        label: translate('Academic projects'),
        value: summary.academicProjects,
      },
      {
        label: translate('Industry projects'),
        value: summary.industryProjects,
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
