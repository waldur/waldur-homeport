import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { OrganizationsChart } from './charts/OrganizationsChart';
import { useUserOrganizations } from './useUserStatistics';

export const UserOrganizationsPage: FC = () => {
  useTitle(translate('User organizations'));
  useReportBreadcrumbs({ category: 'users', currentReport: 'organizations' });

  const { data, isLoading, error, refetch } = useUserOrganizations();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <LoadingErred loadData={refetch} />;
  }

  return <OrganizationsChart data={data} />;
};
