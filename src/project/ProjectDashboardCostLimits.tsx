import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { Panel } from '@waldur/core/Panel';
import { CostPolicy } from '@waldur/customer/cost-policies/types';
import { translate } from '@waldur/i18n';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { ProjectDashboardChart } from './ProjectDashboardChart';
import { ProjectDashboardCostPolicies } from './ProjectDashboardCostPolicies';

export const ProjectDashboardCostLimits = ({
  project,
}: {
  project: Project;
}) => {
  const [costPolicies, setCostPolicies] = useState<CostPolicy[]>([]);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  return (
    <Panel
      className="h-100"
      title={translate('Project cost')}
      actions={
        isOwnerOrStaff && (
          <Link
            state="organization.cost-policies"
            params={{ uuid: project.customer_uuid }}
            className="btn btn-light btn-sm min-w-100px"
          >
            {translate('Manage policies')}
          </Link>
        )
      }
    >
      <div className="d-flex flex-column">
        <Row className="mb-10">
          <ProjectDashboardChart
            project={project}
            costPolicies={costPolicies}
          />
        </Row>
        <Row className="flex-grow-1">
          <Col>
            <div className="h-100">
              <ProjectDashboardCostPolicies
                project={project}
                setCostPolicies={setCostPolicies}
              />
            </div>
          </Col>
        </Row>
      </div>
    </Panel>
  );
};
