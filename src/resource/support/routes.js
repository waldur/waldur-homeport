import { checkPermission } from '@waldur/issues/routes';
import { withStore } from '@waldur/store/connect';

import { ResourcesTreemap } from './ResourcesTreemap';
import { SharedProviderContainer } from './SharedProviderContainer';

// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('support.resources-treemap', {
      url: 'resources-treemap/',
      component: withStore(ResourcesTreemap),
      data: {
        feature: 'support.resources-treemap',
        pageTitle: gettext('Resources usage'),
      },
      resolve: {
        permission: checkPermission,
      },
    })

    .state('support.shared-providers', {
      url: 'shared-providers/',
      component: withStore(SharedProviderContainer),
      data: {
        feature: 'support.shared-providers',
        pageTitle: gettext('Shared providers'),
      },
      resolve: {
        permission: checkPermission,
      },
    });
}
