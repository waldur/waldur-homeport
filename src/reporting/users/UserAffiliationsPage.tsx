import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';

import { ReportingTitle } from '../ReportingTitle';

import { AffiliationsChart } from './charts/AffiliationsChart';
import { useUserAffiliations } from './useUserStatistics';

export const UserAffiliationsPage: FC = () => {
  const affiliationsEnabled = isProfileAttributeEnabled('affiliations');
  const { data, isLoading, error, refetch } = useUserAffiliations();

  if (!affiliationsEnabled) {
    return (
      <>
        <ReportingTitle reportKey="user-affiliations" />
        <NoResult
          title={translate('Affiliations not enabled')}
          message={translate(
            'The affiliations profile attribute is not enabled for this platform.',
          )}
          callback={refetch}
          buttonTitle={translate('Refresh')}
        />
      </>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <ReportingTitle reportKey="user-affiliations" />
      <div className="container-fluid pb-6">
        <AffiliationsChart data={data} refetch={refetch} />
      </div>
    </>
  );
};
