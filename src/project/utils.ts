import { createSelector } from 'reselect';

import { get } from '@waldur/core/api';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import {
  getUser,
  getCustomer,
  isOwnerOrStaff,
  getProject,
} from '@waldur/workspace/selectors';
import { Project, OuterState, Customer, User } from '@waldur/workspace/types';

const getDefaultItems = project => [
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
    feature: 'eventlog',
    index: 500,
  },
  {
    key: 'support',
    state: 'project.issues',
    params: {
      uuid: project.uuid,
    },
    icon: 'fa-question-circle',
    label: translate('Issues'),
    feature: 'support',
    index: 600,
  },
  {
    label: translate('Team'),
    icon: 'fa-group',
    state: 'project.team',
    params: {
      uuid: project.uuid,
    },
    feature: 'team',
    key: 'team',
    countFieldKey: 'users',
    index: 800,
  },
];

export const getSidebarItems = createSelector<
  OuterState,
  User,
  Customer,
  Project,
  boolean,
  MenuItemType[]
>(
  getUser,
  getCustomer,
  getProject,
  isOwnerOrStaff,
  (user, customer, project, ownerOrStaff) => {
    if (!project || !customer || !user) {
      return [];
    }
    if (ownerOrStaff || user.is_support) {
      return [
        {
          key: 'back',
          label: translate('Back to organization'),
          icon: 'fa-arrow-left',
          state: 'organization.dashboard',
          params: { uuid: customer.uuid },
        },
        ...getDefaultItems(project),
      ];
    } else {
      return getDefaultItems(project);
    }
  },
);

export const getProjectCounters = (project: Project, fields: string[]) =>
  get(`/projects/${project.uuid}/counters/`, { params: { fields } }).then(
    response => response.data,
  );

export const getExtraSidebarItems = (): Promise<MenuItemType[]> => {
  const SidebarExtensionService = ngInjector.get('SidebarExtensionService');
  return SidebarExtensionService.getItems('project');
};
