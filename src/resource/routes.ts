import { StateDeclaration } from '@waldur/core/types';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import { loadResource } from './resolve';

export const states: StateDeclaration[] = [
  {
    name: 'resources',
    url: '/resources/',
    abstract: true,
    template: '<ui-view></ui-view>',
    data: {
      auth: true,
      workspace: WOKSPACE_NAMES.project,
      pageClass: 'gray-bg',
    },
  },

  {
    name: 'resources.details',
    url: ':resource_type/:uuid/:tab',
    template: '<resource-header></resource-header>',
    params: {
      tab: {
        value: '',
        dynamic: true,
      },
    },
    resolve: {
      resource: loadResource,
    },
    data: {
      sidebarKey: 'marketplace-project-resources',
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
