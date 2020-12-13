import { createFormAction } from 'redux-form-saga';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { Project } from '@waldur/workspace/types';

const ProjectRemoveDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ProjectRemoveDialog" */ './ProjectRemoveDialog'
    ),
  'ProjectRemoveDialog',
);

export const createProject = createFormAction('waldur/project/CREATE');
export const updateProject = createFormAction('waldur/project/UPDATE');
export const gotoProjectList = createFormAction('waldur/project/GOTO_LIST');

export const GOTO_PROJECT_CREATE = 'waldur/project/GOTO_CREATE';
export const DELETE_PROJECT = 'waldur/project/DELETE';

export const gotoProjectCreate = () => ({
  type: GOTO_PROJECT_CREATE,
});

export const deleteProject = (project: Project) => ({
  type: DELETE_PROJECT,
  payload: { project },
});

export const showProjectRemoveDialog = (
  action: () => void,
  projectName: string,
) =>
  openModalDialog(ProjectRemoveDialog, {
    resolve: { action, projectName },
    size: 'lg',
  });
