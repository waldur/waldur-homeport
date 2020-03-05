import * as React from 'react';

import { $state } from '@waldur/core/services';
import { ActionList } from '@waldur/dashboard/ActionList';
import { getIssueAction } from '@waldur/dashboard/ReportIssueAction';
import { getSupportPortalAction } from '@waldur/dashboard/SupportPortalAction';
import { translate } from '@waldur/i18n';
import { $uibModal } from '@waldur/modal/services';
import { Project, User } from '@waldur/workspace/types';

interface ProjectActionsProps {
  user: User;
  project: Project;
  canAddUser: boolean;
}

const getDetailsAction = project => ({
  title: translate('Details'),
  onClick() {
    $uibModal.open({
      component: 'projectDialog',
      size: 'lg',
      resolve: {
        project: () => project,
      },
    });
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
  ].filter(action => action !== undefined);
  return <ActionList actions={actions} />;
};
