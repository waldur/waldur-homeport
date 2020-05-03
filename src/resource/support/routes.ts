import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { checkPermission } from '@waldur/issues/utils';
import { withStore } from '@waldur/store/connect';

import { ResourcesTreemap } from './ResourcesTreemap';
import { SharedProviderContainer } from './SharedProviderContainer';

export const states: StateDeclaration[] = [
  {
    name: 'support.resources-treemap',
    url: 'resources-treemap/',
    component: withStore(ResourcesTreemap),
    data: {
      feature: 'support.resources-treemap',
      pageTitle: gettext('Resources usage'),
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.shared-providers',
    url: 'shared-providers/',
    component: withStore(SharedProviderContainer),
    data: {
      feature: 'support.shared-providers',
      pageTitle: gettext('Shared providers'),
    },
    resolve: {
      permission: checkPermission,
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
