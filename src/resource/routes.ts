import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const ResourceDetailsContainer = lazyComponent(
  () => import('./ResourceDetailsContainer'),
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
  },
];
