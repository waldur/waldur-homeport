import classNames from 'classnames';
import { FC } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';

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
      <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'pb-5')}>
        <AffiliationsChart data={data} refetch={refetch} />
      </div>
    </>
  );
};
