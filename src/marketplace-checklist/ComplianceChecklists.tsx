import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

import { countChecklists, getProjectStats } from './api';
import { ChartHeader } from './ChartHeader';
import { PieChart } from './PieChart';

const ProjectChecklist = ({ project }) => {
  const state = useAsync(() => getProjectStats(project.uuid), [project]);

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <h3>{translate('Unable to load checklists.')}</h3>;
  }

  if (!state.value) {
    return null;
  }

  return (
    <Row>
      {state.value.map((checklist) => (
        <Col key={checklist.uuid} md={3}>
          <ChartHeader label={`${checklist.score} %`} value={checklist.name} />
          <PieChart
            positive={checklist.positive_count}
            negative={checklist.negative_count}
            unknown={checklist.unknown_count}
          />
        </Col>
      ))}
    </Row>
  );
};

export const ComplianceChecklists: FunctionComponent = () => {
  const project = useSelector(getProject);
  if (!project) {
    return null;
  }

  const statsState = useAsync(countChecklists);

  if (statsState.loading) {
    return <LoadingSpinner />;
  }

  if (statsState.error) {
    return null;
  }

  if (!statsState.value) {
    return null;
  }

  return (
    <Panel title={translate('Checklists')}>
      <ProjectChecklist project={project} />
    </Panel>
  );
};
