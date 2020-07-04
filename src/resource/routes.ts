import { StateDeclaration } from '@waldur/core/types';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

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
      workspace: PROJECT_WORKSPACE,
      sidebarKey: 'marketplace-project-resources',
    },
  },
];
