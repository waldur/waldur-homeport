import { FC } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';

import { ReportingTitle } from '../ReportingTitle';

import { ActiveStatusChart } from './charts/ActiveStatusChart';
import { AuthMethodsChart } from './charts/AuthMethodsChart';
import { IdentitySourcesChart } from './charts/IdentitySourcesChart';
import { JobPositionsChart } from './charts/JobPositionsChart';
import { LanguagesChart } from './charts/LanguagesChart';
import { OrganizationTypesChart } from './charts/OrganizationTypesChart';
import { SummaryCards } from './charts/SummaryCards';
import {
  computeStatisticsSummary,
  useUserStatistics,
} from './useUserStatistics';

export const UserDemographicsPage: FC = () => {
  const { data, isLoading, error, refetch } = useUserStatistics();

  // Check which profile attributes are enabled
  const showIdentitySource = isProfileAttributeEnabled('identity_source');
  const showOrganizationType = isProfileAttributeEnabled('organization_type');
  const showJobTitle = isProfileAttributeEnabled('job_title');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <LoadingErred loadData={refetch} />;
  }

  const summary = computeStatisticsSummary(data);

  return (
    <>
      <ReportingTitle reportKey="user-demographics" />
      <SummaryCards summary={summary} />

      <div
        className={
          showIdentitySource
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4'
            : 'grid grid-cols-1 gap-4 mb-4'
        }
      >
        <div>
          <AuthMethodsChart data={data.authMethods} />
        </div>
        {showIdentitySource && (
          <div>
            <IdentitySourcesChart data={data.identitySources} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <ActiveStatusChart data={data.activeStatus} />
        </div>
        <div>
          <LanguagesChart data={data.languages} />
        </div>
      </div>

      {(showOrganizationType || showJobTitle) && (
        <div
          className={
            showOrganizationType && showJobTitle
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4'
              : 'grid grid-cols-1 gap-4 mb-4'
          }
        >
          {showOrganizationType && (
            <div>
              <OrganizationTypesChart data={data.organizationTypes} />
            </div>
          )}
          {showJobTitle && (
            <div>
              <JobPositionsChart data={data.jobTitles} />
            </div>
          )}
        </div>
      )}
    </>
  );
};
