import { createSelector } from 'reselect';

import { ENV } from '@waldur/configs/default';
import { get } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { SidebarExtensionService } from '@waldur/navigation/sidebar/SidebarExtensionService';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { filterItems } from '@waldur/navigation/sidebar/utils';
import { RootState } from '@waldur/store/reducers';
import {
  getUser,
  getCustomer,
  isOwnerOrStaff,
  getProject,
} from '@waldur/workspace/selectors';
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
  ENV.FEATURES.PROJECT.EVENTS && {
    key: 'eventlog',
    state: 'project.events',
    params: {
      uuid: project.uuid,
    },
    icon: 'fa-bell-o',
    label: translate('Audit logs'),
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
  ENV.FEATURES.PROJECT.TEAM && {
    label: translate('Team'),
    icon: 'fa-group',
    state: 'project.team',
    params: {
      uuid: project.uuid,
    },
    key: 'team',
    countFieldKey: 'users',
    index: 800,
  },
];

export const getSidebarItems = createSelector<
  RootState,
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
      return filterItems([
        {
          key: 'back',
          label: translate('Back to organization'),
          icon: 'fa-arrow-left',
          state: 'organization.dashboard',
          params: { uuid: customer.uuid },
        },
        ...getDefaultItems(project),
      ]);
    } else {
      return filterItems(getDefaultItems(project));
    }
  },
);

export const getProjectCounters = (project: Project, fields: string[]) =>
  get(`/projects/${project.uuid}/counters/`, { params: { fields } }).then(
    (response) => response.data,
  );

export const getExtraSidebarItems = (): Promise<MenuItemType[]> => {
  return SidebarExtensionService.getItems(PROJECT_WORKSPACE);
};
