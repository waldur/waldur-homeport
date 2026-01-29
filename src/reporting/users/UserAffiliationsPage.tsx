import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { AffiliationsChart } from './charts/AffiliationsChart';
import { useUserAffiliations } from './useUserStatistics';

export const UserAffiliationsPage: FC = () => {
  useTitle(translate('User affiliations'));
  useReportBreadcrumbs({ category: 'users', currentReport: 'affiliations' });

  const affiliationsEnabled = isProfileAttributeEnabled('affiliations');
  const { data, isLoading, error, refetch } = useUserAffiliations();

  if (!affiliationsEnabled) {
    return (
      <NoResult
        title={translate('Affiliations not enabled')}
        message={translate(
          'The affiliations profile attribute is not enabled for this platform.',
        )}
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <LoadingErred loadData={refetch} />;
  }

  return <AffiliationsChart data={data} />;
};
