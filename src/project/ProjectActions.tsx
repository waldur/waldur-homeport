import { FunctionComponent } from 'react';

import { ActionList } from '@waldur/dashboard/ActionList';
import { getIssueAction } from '@waldur/dashboard/ReportIssueAction';
import { getSupportPortalAction } from '@waldur/dashboard/SupportPortalAction';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { Project, User } from '@waldur/workspace/types';

interface ProjectActionsProps {
  user: User;
  project: Project;
  canAddUser: boolean;
}

const getDetailsAction = (project) => ({
  title: translate('Details'),
  onClick() {
    router.stateService.go('project.manage', { uuid: project.uuid });
  },
});

const getTeamAction = (props: ProjectActionsProps) => {
  if (!props.canAddUser) {
    return undefined;
  }
  return {
    title: translate('Add team member'),
    onClick() {
      router.stateService.go('project.team');
    },
  };
};

export const ProjectActions: FunctionComponent<ProjectActionsProps> = (
  props,
) => {
  const actions = [
    getDetailsAction(props.project),
    getTeamAction(props),
    getIssueAction({
      issue: { project: props.project },
    }),
    getSupportPortalAction(),
  ].filter((action) => action !== undefined);
  return <ActionList actions={actions} />;
};
