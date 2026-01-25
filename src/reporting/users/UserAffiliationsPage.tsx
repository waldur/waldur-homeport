import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { AffiliationsChart } from './charts/AffiliationsChart';
import { useUserAffiliations } from './useUserStatistics';

export const UserAffiliationsPage: FC = () => {
  useTitle(translate('User affiliations'));
  useReportBreadcrumbs({ category: 'users', currentReport: 'affiliations' });

  const { data, isLoading, error, refetch } = useUserAffiliations();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <LoadingErred loadData={refetch} />;
  }

  return <AffiliationsChart data={data} />;
};
