import { StateDeclaration } from '@waldur/core/types';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import { loadResource } from './resolve';

export const states: StateDeclaration[] = [
  {
    name: 'resource-details',
    url: '/resources/:resource_type/:uuid/:tab',
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
      auth: true,
      workspace: WOKSPACE_NAMES.project,
      pageClass: 'gray-bg',
      sidebarKey: 'marketplace-project-resources',
    },
  },
];
