import { createSelector } from 'reselect';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { SidebarExtensionService } from '@waldur/navigation/sidebar/SidebarExtensionService';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { RootState } from '@waldur/store/reducers';
import { getUser, getCustomer, getProject } from '@waldur/workspace/selectors';
import {
  Project,
  Customer,
  User,
  PROJECT_WORKSPACE,
} from '@waldur/workspace/types';

const getDefaultItems = (project) => [
  {
    key: 'dashboard',
    icon: 'fa-th-large',
    label: translate('Dashboard'),
    state: 'project.details',
    params: {
      uuid: project.uuid,
    },
    index: 100,
  },
  {
    key: 'eventlog',
    state: 'project.events',
    params: {
      uuid: project.uuid,
    },
    icon: 'fa-bell-o',
    label: translate('Audit logs'),
    feature: 'project.events',
    index: 500,
  },
  ENV.plugins.WALDUR_SUPPORT && {
    key: 'support',
    state: 'project.issues',
    params: {
      uuid: project.uuid,
    },
    icon: 'fa-question-circle',
    label: translate('Issues'),
    index: 600,
  },
  {
    label: translate('Team'),
    icon: 'fa-group',
    state: 'project.team',
    params: {
      uuid: project.uuid,
    },
    feature: 'project.team',
    key: 'team',
    countFieldKey: 'users',
    index: 800,
  },
];

export const getProjectSidebarItems = createSelector<
  RootState,
  User,
  Customer,
  Project,
  MenuItemType[]
>(getUser, getCustomer, getProject, (user, customer, project) => {
  if (!project || !customer || !user) {
    return [];
  }
  return getDefaultItems(project).filter(Boolean);
});

export const getExtraProjectSidebarItems = (): Promise<MenuItemType[]> => {
  return SidebarExtensionService.getItems(PROJECT_WORKSPACE);
};
