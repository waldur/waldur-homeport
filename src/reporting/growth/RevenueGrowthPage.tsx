import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { RevenueGrowthChart } from './RevenueGrowthChart';

export const RevenueGrowthPage: FC = () => {
  useTitle(translate('Revenue growth'));
  useReportBreadcrumbs({
    category: 'financial',
    currentReport: 'growth',
  });

  return <RevenueGrowthChart />;
};
