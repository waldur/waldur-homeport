import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { loadResource } from './resolve';

const ResourceDetailsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceDetailsContainer" */ './ResourceDetailsContainer'
    ),
  'ResourceDetailsContainer',
);

export const states: StateDeclaration[] = [
  {
    // name: 'marketplace-project-resources',
    name: 'resource-details',
    url: 'resources/:resource_type/:resource_uuid/', // resource details state url
    // url: '/resources/:resource_type/:uuid/:tab',
    component: ResourceDetailsContainer,
    parent: 'marketplace-project-resources',
    params: {
      tab: {
        value: '',
        dynamic: true,
      },
    },
    resolve: [
      {
        token: 'resource',
        deps: ['$transition$'],
        resolveFn: loadResource,
      },
    ],
    data: {
      auth: true,
      workspace: PROJECT_WORKSPACE,
      sidebarKey: 'marketplace-project-resources',
    },
  },
];
