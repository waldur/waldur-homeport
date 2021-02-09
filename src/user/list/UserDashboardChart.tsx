import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { DashboardCounter } from '@waldur/dashboard/DashboardCounter';
import { translate } from '@waldur/i18n';
import { getUserMonthlyActivity } from '@waldur/user/api';
import { UserActions } from '@waldur/user/list/UserActions';
import { formatUserMonthlyActivityChart } from '@waldur/user/utils';
import { User } from '@waldur/workspace/types';

interface UserDashboardChart {
  user: User;
}

export const UserDashboardChart: FunctionComponent<UserDashboardChart> = ({
  user,
}) => {
  const { loading, error, value } = useAsync(
    () => getUserMonthlyActivity(user.url).then(formatUserMonthlyActivityChart),
    [user],
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load user monthly activity data.')}</>
  ) : (
    <div style={{ paddingLeft: 10 }}>
      <Row>
        <Col md={4}>
          <DashboardCounter
            label={value.chart.title}
            value={value.chart.current}
          />
          <EChart options={value.options} height="100px" />
        </Col>
        <Col md={4}>{/*empty for now*/}</Col>
        <Col md={4}>
          <UserActions user={user} />
        </Col>
      </Row>
    </div>
  );
};
