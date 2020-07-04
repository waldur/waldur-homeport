import { StateDeclaration } from '@waldur/core/types';
import { USER_WORKSPACE } from '@waldur/workspace/types';

import { KeyCreateForm } from './keys/KeyCreateForm';
import { UserEmailChangeCallback } from './support/UserEmailChangeCallback';
import { tabs, requireIdParam } from './tabs';
import { UserDetails } from './UserDetails';

export const states: StateDeclaration[] = [
  {
    name: 'profile',
    url: '/profile/',
    abstract: true,
    data: {
      auth: true,
      workspace: USER_WORKSPACE,
    },
    component: UserDetails,
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
      workspace: USER_WORKSPACE,
    },
    component: UserDetails,
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
    component: UserEmailChangeCallback,
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'keys',
    url: '/keys/',
    abstract: true,
    component: UserDetails,
    data: {
      auth: true,
      workspace: USER_WORKSPACE,
    },
  },

  { name: 'keys.create', url: 'add/', component: KeyCreateForm },
];
