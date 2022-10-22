import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

import { loadOecdCodes } from './api';
import { ProjectDelete } from './ProjectDelete';
import { ProjectUpdateContainer } from './ProjectUpdateContainer';

export const ProjectManage: FunctionComponent = () => {
  const project = useSelector(getProject);
  const { loading, value: oecdCodes } = useAsync(loadOecdCodes);
  return loading ? (
    <LoadingSpinner />
  ) : (
    <>
      <Card className="mb-6">
        <Card.Header>{translate('Project settings')}</Card.Header>
        <Card.Body>
          <ProjectUpdateContainer project={project} oecdCodes={oecdCodes} />
        </Card.Body>
      </Card>
      <ProjectDelete project={project} />
    </>
  );
};
