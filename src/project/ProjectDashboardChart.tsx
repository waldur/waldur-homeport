import { FunctionComponent } from 'react';
import { Col } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { CostPolicy } from '@waldur/customer/cost-policies/types';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { loadChart } from './utils';

interface ProjectDashboardProps {
  project: Project;
  costPolicies: CostPolicy[];
}

export const ProjectDashboardChart: FunctionComponent<ProjectDashboardProps> =
  ({ project, costPolicies }) => {
    const { loading, error, value } = useAsync(
      () => loadChart(project, costPolicies),
      [project, costPolicies],
    );
    if (loading) {
      return <LoadingSpinner />;
    } else if (error) {
      <>{translate('Unable to load data.')}</>;
    }
    return (
      <>
        <Col xs={7}>
          <EChart options={value.options} height="100px" />
        </Col>
        <Col>
          <div>
            <h1 className="fw-bold">{value.chart.current}</h1>
            <h5 className="fw-bold text-uppercase">{value.chart.title}</h5>
          </div>
        </Col>
      </>
    );
  };
