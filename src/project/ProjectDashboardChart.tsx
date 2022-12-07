import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { ProjectOrderItemsList } from './ProjectOrderItemsList';
import { loadChart } from './utils';

interface ProjectDashboardProps {
  project: Project;
}

export const ProjectDashboardChart: FunctionComponent<ProjectDashboardProps> =
  ({ project }) => {
    const { loading, error, value } = useAsync(
      () => loadChart(project),
      [project],
    );
    if (loading) {
      return <LoadingSpinner />;
    } else if (error) {
      <>{translate('Unable to load data.')}</>;
    }
    return (
      <Card className="h-100">
        <Card.Body className="d-flex flex-column">
          <Row className="mb-10">
            <Col xs={7}>
              <EChart options={value.options} height="100px" />
            </Col>
            <Col>
              <div>
                <h1 className="fw-bold">{value.chart.current}</h1>
                <h5 className="fw-bold text-uppercase">{value.chart.title}</h5>
              </div>
            </Col>
          </Row>
          <Row className="flex-grow-1">
            <Col>
              <div className="d-flex flex-column justify-content-between h-100">
                <ProjectOrderItemsList />
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
