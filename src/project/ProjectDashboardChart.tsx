import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Col } from 'react-bootstrap';

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

export const ProjectDashboardChart: FunctionComponent<
  ProjectDashboardProps
> = ({ project, costPolicies }) => {
  const { data, isLoading, error } = useQuery(
    ['ProjectDashboardChart', project.uuid, costPolicies.length],
    () => loadChart(project, costPolicies),
    { staleTime: 5 * 60 * 1000 },
  );
  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    <>{translate('Unable to load data.')}</>;
  }
  return (
    <>
      <Col xs={7}>
        <EChart options={data.options} height="100px" />
      </Col>
      <Col>
        <div>
          <h1 className="fw-bold">{data.chart.current}</h1>
          <h5 className="fw-bold text-uppercase">{data.chart.title}</h5>
        </div>
      </Col>
    </>
  );
};
