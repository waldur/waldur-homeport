import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { countChecklists } from '@waldur/marketplace-checklist/api';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { CustomerPermissions } from './CustomerPermissions';
import { ProjectPermissions } from './ProjectPermissions';
import { UserDashboardChart } from './UserDashboardChart';
import { UserProfile } from './UserProfile';
import { UserWelcome } from './UserWelcome';

export const UserDashboard: React.FC = () => {
  const user = useSelector(getUser) as UserDetails;

  const asyncState = useAsync(countChecklists);

  return asyncState.loading ? (
    <LoadingSpinner />
  ) : asyncState.error ? (
    <>{translate('Unable to load data.')}</>
  ) : (
    <>
      <UserWelcome user={user} />
      <UserProfile user={user} />
      <UserDashboardChart user={user} hasChecklists={asyncState.value > 0} />
      <Row>
        <Col md={12} lg={6}>
          <CustomerPermissions title={translate('Organizations')} />
        </Col>
        <Col md={12} lg={6}>
          <ProjectPermissions title={translate('Projects')} />
        </Col>
      </Row>
    </>
  );
};
