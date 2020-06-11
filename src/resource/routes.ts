import { StateDeclaration } from '@waldur/core/types';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import { loadResource } from './resolve';
import { ResourceDetailsContainer } from './ResourceDetailsContainer';

export const states: StateDeclaration[] = [
  {
    name: 'resource-details',
    url: '/resources/:resource_type/:uuid/:tab',
    component: ResourceDetailsContainer,
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
      sidebarKey: 'marketplace-project-resources',
    },
  },
];
