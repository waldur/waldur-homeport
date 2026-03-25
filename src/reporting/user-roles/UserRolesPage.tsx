import { FC } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { RoleDistributionChart } from './RoleDistributionChart';
import { RoleDistributionTable } from './RoleDistributionTable';
import { UserRolesSummaryCards } from './UserRolesSummaryCards';
import { useUserRoleStats, useUserRolesSummary } from './useUserRoleStats';

export const UserRolesPage: FC = () => {
  useTitle(translate('Role distribution'));
  useReportBreadcrumbs({
    category: 'users',
    currentReport: 'user-roles',
  });

  const { data, isLoading, error, refetch } = useUserRoleStats();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useUserRolesSummary();

  if (isLoading || summaryLoading) {
    return <LoadingSpinner />;
  }

  if (error || summaryError) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!data || !summary || summary.totalOrganizations === 0) {
    return (
      <NoResult
        title={translate('No role data found')}
        message={translate('There is no organization member data to display.')}
        callback={refetch}
      />
    );
  }

  return (
    <div className="container-fluid py-6">
      <Alert variant="light" className="mb-6">
        <div className="d-flex align-items-center">
          <i className="fa fa-info-circle me-3 text-primary fs-4" />
          <div>
            <strong>{translate('Note')}:</strong>{' '}
            {translate(
              'This report shows member counts per organization. Detailed role distribution (Owner, Manager, Member) requires a backend endpoint that is not yet available.',
            )}
          </div>
        </div>
      </Alert>

      <UserRolesSummaryCards summary={summary} />

      <Row className="g-6 mb-6">
        <Col xs={12}>
          <RoleDistributionChart data={data.memberCounts} />
        </Col>
      </Row>

      <RoleDistributionTable data={data.memberCounts} />
    </div>
  );
};
