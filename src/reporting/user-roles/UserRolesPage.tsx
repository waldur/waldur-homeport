import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { RoleDistributionChart } from './RoleDistributionChart';
import { RoleDistributionTable } from './RoleDistributionTable';
import { UserRolesSummaryCards } from './UserRolesSummaryCards';
import { useUserRoleStats, useUserRolesSummary } from './useUserRoleStats';

export const UserRolesPage: FC = () => {
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
    <>
      <ReportingTitle reportKey="user-roles" />
      <UserRolesSummaryCards summary={summary} />

      <Row className="g-6 mb-6">
        <Col xs={12}>
          <RoleDistributionChart data={data.memberCounts} />
        </Col>
      </Row>

      <RoleDistributionTable data={data.memberCounts} />
    </>
  );
};
