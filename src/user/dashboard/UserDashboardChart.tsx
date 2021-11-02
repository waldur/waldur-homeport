import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { DashboardCounter } from '@waldur/dashboard/DashboardCounter';
import { translate } from '@waldur/i18n';
import { PieChart } from '@waldur/marketplace-checklist/PieChart';
import { User } from '@waldur/workspace/types';

import { UserActions } from './UserActions';
import { loadCharts } from './utils';

interface UserDashboardChart {
  user: User;
  hasChecklists: boolean;
}

export const UserDashboardChart: FunctionComponent<UserDashboardChart> = ({
  user,
  hasChecklists,
}) => {
  const { loading, error, value } = useAsync(
    () => loadCharts(user, hasChecklists),
    [user, hasChecklists],
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
            label={value.events.title}
            value={value.events.current}
          />
          <EChart options={value.events.chart} height="100px" />
        </Col>
        <Col md={4}>
          {hasChecklists ? (
            <>
              <DashboardCounter
                label={translate('Average of all checklists')}
                value={`${value.checklists.score}%`}
              />
              <PieChart
                positive={value.checklists.score}
                negative={100 - value.checklists.score}
                height="100px"
              />
            </>
          ) : null}
        </Col>
        <Col md={4}>
          <UserActions user={user} />
        </Col>
      </Row>
    </div>
  );
};
