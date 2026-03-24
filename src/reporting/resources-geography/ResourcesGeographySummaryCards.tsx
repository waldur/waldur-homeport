import { FC, useMemo } from 'react';

import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';

import { ResourcesGeographySummary } from './types';

interface ResourcesGeographySummaryCardsProps {
  summary: ResourcesGeographySummary;
}

export const ResourcesGeographySummaryCards: FC<
  ResourcesGeographySummaryCardsProps
> = ({ summary }) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Total resources'),
        value: summary.totalResources,
      },
      {
        label: translate('Countries'),
        value: summary.countriesWithResources,
      },
      {
        label: translate('Organization groups'),
        value: summary.orgGroupsWithResources,
      },
      {
        label: translate('Offerings'),
        value: summary.offeringsWithResources,
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
