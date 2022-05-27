import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { User } from '@waldur/workspace/types';

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
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col md={6}>
            <Row>
              <Col xs={7}>
                <EChart options={value.events.chart} height="100px" />
              </Col>
              <Col>
                <h1 className="fw-bold">{value.events.current}</h1>
                <h5 className="fw-bold text-uppercase">{value.events.title}</h5>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
