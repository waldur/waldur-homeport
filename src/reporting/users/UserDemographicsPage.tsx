import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';

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

      <Row className="mb-6 g-6">
        <Col xs={12} lg={showIdentitySource ? 6 : 12}>
          <AuthMethodsChart data={data.authMethods} />
        </Col>
        {showIdentitySource && (
          <Col xs={12} lg={6}>
            <IdentitySourcesChart data={data.identitySources} />
          </Col>
        )}
      </Row>

      <Row className="mb-6 g-6">
        <Col xs={12} lg={6}>
          <ActiveStatusChart data={data.activeStatus} />
        </Col>
        <Col xs={12} lg={6}>
          <LanguagesChart data={data.languages} />
        </Col>
      </Row>

      {(showOrganizationType || showJobTitle) && (
        <Row className="mb-6 g-6">
          {showOrganizationType && (
            <Col xs={12} lg={showJobTitle ? 6 : 12}>
              <OrganizationTypesChart data={data.organizationTypes} />
            </Col>
          )}
          {showJobTitle && (
            <Col xs={12} lg={showOrganizationType ? 6 : 12}>
              <JobPositionsChart data={data.jobTitles} />
            </Col>
          )}
        </Row>
      )}
    </>
  );
};
