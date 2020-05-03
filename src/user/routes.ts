import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { withStore } from '@waldur/store/connect';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import { KeyCreateForm } from './keys/KeyCreateForm';
import { UserEmailChangeCallback } from './support/UserEmailChangeCallback';
import { tabs, requireIdParam } from './tabs';

export const states: StateDeclaration[] = [
  {
    name: 'profile',
    url: '/profile/',
    abstract: true,
    data: {
      auth: true,
      workspace: WOKSPACE_NAMES.user,
    },
    template: '<user-details></user-details>',
  },

  { name: 'profile.details', ...tabs.dashboard },
  { name: 'profile.events', ...tabs.events },
  { name: 'profile.keys', ...tabs.keys },
  { name: 'profile.notifications', ...tabs.notifications },
  { name: 'profile.manage', ...tabs.manage },
  { name: 'profile.freeipa', ...tabs.freeipa },

  {
    name: 'users',
    url: '/users/:uuid/',
    abstract: true,
    data: {
      auth: true,
      workspace: WOKSPACE_NAMES.user,
    },
    template: '<user-details></user-details>',
    resolve: {
      requireIdParam,
    },
  },

  { name: 'users.details', ...tabs.events },
  { name: 'users.keys', ...tabs.keys },
  { name: 'users.notifications', ...tabs.notifications },
  { name: 'users.manage', ...tabs.manage },
  { name: 'users.freeipa', ...tabs.freeipa },

  {
    name: 'user-email-change',
    url: '/user_email_change/:token/',
    component: withStore(UserEmailChangeCallback),
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'keys',
    url: '/keys/',
    abstract: true,
    template: '<user-details></user-details>',
    data: {
      auth: true,
      pageTitle: gettext('Add SSH key'),
      workspace: WOKSPACE_NAMES.user,
    },
  },

  { name: 'keys.create', url: 'add/', component: withStore(KeyCreateForm) },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
