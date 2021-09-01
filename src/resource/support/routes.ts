import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { checkPermission } from '@waldur/issues/utils';

const ResourcesTreemap = lazyComponent(
  () => import(/* webpackChunkName: "ResourcesTreemap" */ './ResourcesTreemap'),
  'ResourcesTreemap',
);
const SharedProviderContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SharedProviderContainer" */ './SharedProviderContainer'
    ),
  'SharedProviderContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'support.resources-treemap',
    url: 'resources-treemap/',
    component: ResourcesTreemap,
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.shared-providers',
    url: 'shared-providers/',
    component: SharedProviderContainer,
    resolve: {
      permission: checkPermission,
    },
  },
];
