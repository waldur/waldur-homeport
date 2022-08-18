import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { loadChart } from './utils';

interface ProjectDashboardProps {
  project: Project;
}

export const ProjectDashboardChart: FunctionComponent<ProjectDashboardProps> =
  ({ project }) => {
    const { loading, value } = useAsync(() => loadChart(project), [project]);
    if (loading) {
      return <LoadingSpinner />;
    }
    return (
      <Card className="h-100">
        <Card.Body>
          <Row className="h-100">
            <Col xs={7}>
              <EChart options={value.options} height="100px" />
            </Col>
            <Col>
              <div className="d-flex flex-column justify-content-between h-100">
                <div>
                  <h1 className="fw-bold">{value.chart.current}</h1>
                  <h5 className="fw-bold text-uppercase">
                    {value.chart.title}
                  </h5>
                </div>
                <div className="text-end">
                  <Link
                    state="marketplace-order-list"
                    params={{ uuid: project.uuid }}
                    className="btn btn-light btn-sm min-w-100px"
                  >
                    {translate('Billing')}
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };
