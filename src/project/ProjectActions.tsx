import * as React from 'react';

import { $state } from '@waldur/core/services';
import { ActionList } from '@waldur/dashboard/ActionList';
import { translate } from '@waldur/i18n';
import { $uibModal } from '@waldur/modal/services';
import { Project } from '@waldur/workspace/types';

interface ProjectActionsProps {
  project: Project;
}

export const ProjectActions = (props: ProjectActionsProps) => (
  <ActionList actions={[
    {
      title: translate('Details'),
      onClick() {
        $uibModal.open({
          component: 'projectDialog',
          size: 'lg',
          resolve: {
            project: () => props.project,
          },
        });
      },
    },
    {
      title: translate('Invite team member'),
      onClick() {
        $state.go('project.team');
      },
    },
    {
      title: translate('Report issue'),
      onClick() {
        $uibModal.open({
          component: 'issueCreateDialog',
          resolve: {
            issue: () => ({project: props.project}),
          },
        });
      },
    },
  ]}/>
);
