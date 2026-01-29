import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { useTitle } from '@waldur/navigation/title';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ActiveStatusChart } from './charts/ActiveStatusChart';
import { AuthMethodsChart } from './charts/AuthMethodsChart';
import { IdentitySourcesChart } from './charts/IdentitySourcesChart';
import { JobPositionsChart } from './charts/JobPositionsChart';
import { LanguagesChart } from './charts/LanguagesChart';
import { OrganizationTypesChart } from './charts/OrganizationTypesChart';
import { RegistrationTrendChart } from './charts/RegistrationTrendChart';
import { SummaryCards } from './charts/SummaryCards';
import {
  computeStatisticsSummary,
  useUserStatistics,
} from './useUserStatistics';

export const UserDemographicsPage: FC = () => {
  useTitle(translate('User demographics'));
  useReportBreadcrumbs({ category: 'users', currentReport: 'demographics' });

  const { data, isLoading, error, refetch } = useUserStatistics();

  const showExperimental = isExperimentalUiComponentsVisible();

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
    <div>
      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Authentication Charts Row */}
      <Row className="mb-6 g-4">
        <Col xs={12} lg={showIdentitySource ? 6 : 12}>
          <AuthMethodsChart data={data.authMethods} />
        </Col>
        {showIdentitySource && (
          <Col xs={12} lg={6}>
            <IdentitySourcesChart data={data.identitySources} />
          </Col>
        )}
      </Row>

      {/* Status and Languages Row */}
      <Row className="mb-6 g-4">
        <Col xs={12} lg={6}>
          <ActiveStatusChart data={data.activeStatus} />
        </Col>
        <Col xs={12} lg={6}>
          <LanguagesChart data={data.languages} />
        </Col>
      </Row>

      {/* Registration Trend */}
      <Row className="mb-6 g-4">
        <Col xs={12}>
          <RegistrationTrendChart data={data.registrationTrend} />
        </Col>
      </Row>

      {/* Organization Type and Job Position Row */}
      {(showOrganizationType || showJobTitle) && (
        <Row className="mb-6 g-4">
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

      {/* Link to analytics page when experimental is enabled */}
      {showExperimental && (
        <div className="mt-6 text-muted text-center">
          <Link
            state="reporting-user-demographics-analytics"
            className="text-primary"
          >
            {translate('Advanced analytics available')}
          </Link>
        </div>
      )}
    </div>
  );
};
