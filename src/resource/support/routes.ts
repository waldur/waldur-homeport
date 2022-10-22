import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

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
    name: 'reporting.resources-treemap',
    url: 'resources-treemap/',
    component: ResourcesTreemap,
    data: {
      feature: 'support.resources_treemap',
      breadcrumb: () => translate('Resources usage'),
    },
  },

  {
    name: 'support.shared-providers',
    url: 'shared-providers/',
    component: SharedProviderContainer,
    data: {
      feature: 'support.shared_providers',
      breadcrumb: () => translate('Shared providers'),
    },
  },
];
