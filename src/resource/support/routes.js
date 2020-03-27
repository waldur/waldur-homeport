import { checkPermission } from '@waldur/issues/routes';

// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('support.resources-treemap', {
      url: 'resources-treemap/',
      template: '<resources-treemap></resources-treemap>',
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
      template: '<support-shared-providers></support-shared-providers>',
      data: {
        feature: 'support.shared-providers',
        pageTitle: gettext('Shared providers'),
      },
      resolve: {
        permission: checkPermission,
      },
    });
}
