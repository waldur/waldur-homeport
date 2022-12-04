import React from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { createProject, gotoProjectList } from './actions';
import { ProjectCreateForm } from './ProjectCreateForm';

export const ProjectCreateContainer: React.FC<{}> = () => {
  useTitle(translate('Create project'));
  const dispatch = useDispatch();
  const onSubmit = (data) => createProject(data, dispatch);
  const onCancel = () => gotoProjectList(null, dispatch);
  return (
    <Card>
      <Card.Body>
        <ProjectCreateForm onSubmit={onSubmit} onCancel={onCancel} />
      </Card.Body>
    </Card>
  );
};
