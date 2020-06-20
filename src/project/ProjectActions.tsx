import * as React from 'react';

import { $state } from '@waldur/core/services';
import { ActionList } from '@waldur/dashboard/ActionList';
import { getIssueAction } from '@waldur/dashboard/ReportIssueAction';
import { getSupportPortalAction } from '@waldur/dashboard/SupportPortalAction';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import store from '@waldur/store/store';
import { Project, User } from '@waldur/workspace/types';

import { ProjectDetailsDialog } from './ProjectDetailsDialog';

interface ProjectActionsProps {
  user: User;
  project: Project;
  canAddUser: boolean;
}

const getDetailsAction = (project) => ({
  title: translate('Details'),
  onClick() {
    store.dispatch(
      openModalDialog(ProjectDetailsDialog, {
        size: 'lg',
        resolve: {
          project,
        },
      }),
    );
  },
});

const getTeamAction = (props: ProjectActionsProps) => {
  if (!props.canAddUser) {
    return undefined;
  }
  return {
    title: translate('Add team member'),
    onClick() {
      $state.go('project.team');
    },
  };
};

export const ProjectActions = (props: ProjectActionsProps) => {
  const actions = [
    getDetailsAction(props.project),
    getTeamAction(props),
    getIssueAction({
      issue: { project: props.project },
      state: 'project.issues',
    }),
    getSupportPortalAction(),
  ].filter((action) => action !== undefined);
  return <ActionList actions={actions} />;
};
