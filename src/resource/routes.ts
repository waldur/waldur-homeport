import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

const ResourceDetailsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceDetailsContainer" */ './ResourceDetailsContainer'
    ),
  'ResourceDetailsContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'resource-details',
    url: 'resources/:resource_type/:resource_uuid/:tab',
    component: ResourceDetailsContainer,
    params: {
      tab: {
        value: '',
        dynamic: true,
      },
    },
    parent: 'project',
    data: {
      auth: true,
      workspace: PROJECT_WORKSPACE,
      sidebarKey: 'marketplace-project-resources',
    },
  },
];
